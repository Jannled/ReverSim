import random
import re
import sys
from typing import TYPE_CHECKING, Any, Dict, List, Optional, Tuple, Union, cast

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import ( 
	Mapped,
	mapped_column,
	reconstructor, # type: ignore
	relationship,
)

from app.config import LEVEL_ENCODING, PHASES_WITH_LEVELS
from app.model.Level import (
	ALL_LEVEL_TYPES,
	KEY_CAMOUFLAGE,
	KEY_COVERT,
	CachedLevel,
	Level,
)
from app.model.LogEvents import ChronoEvent
from app.model.TimerMixin import TimerMixin
from app.model.TutorialStatus import TutorialStatus
from app.storage.database import LEN_PHASE, db
from app.storage.modelFormatError import ModelFormatError
from app.storage.ParticipantLogger import ParticipantLogger
from app.utilsGame import (
	ClientTime,
	LevelType,
	PhaseType,
	getFileLines,
	getShortPseudo,
	now,
	safe_join,
)

if TYPE_CHECKING:
	from app.model.Participant import Participant


class Phase(db.Model, TimerMixin):
	id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
	pseudonym: Mapped[str] = mapped_column(ForeignKey("participant.pseudonym"))
	participant: Mapped['Participant'] = relationship(back_populates="phases")

	name: Mapped[str] = mapped_column(String(LEN_PHASE))

	# NOTE: By default, lists are always sorted by their primary key when loaded from the
	# database, the actual order is never stored! We need to implement this feature 
	# ourself with the `order_by` attribute. We assume, that the db driver will still
	# use the primary key as the secondary sorting criteria
	levels: Mapped[List[Level]] = relationship(order_by="Level.levelPosition")
	levelIdx: Mapped[int] = mapped_column(default=0) # Index of currently active level

	# The level progress that is shown to the player
	numTasks: Mapped[int] = mapped_column(default=0)
	tasksRemaining: Mapped[int] = mapped_column(default=0)

	# Screenshot storage
	index: Mapped[int] = mapped_column(default=0)
	picNmbr: Mapped[int] = mapped_column(default=0)

	# The time after which the first level is shown. This will be different to 
	# `timeStarted`, if the Phase starts with an info screen.
	timeFirstLevel: Mapped[ClientTime] = mapped_column(default=-1)


	def __init__(self, phaseName: str, index: int, phaseConfig: Dict[str, Any], logger: ParticipantLogger) -> None:		
		self.name = phaseName
		self.index = index

		# Non persisted attributes
		self.phaseConfig: dict[str, Any]
		self.logger: ParticipantLogger

		self.phaseConfig = phaseConfig
		self.logger = logger
		#self.init_on_load()

		# Sanity check the value range
		if 'timeLimit' in self.phaseConfig:
			self.timeLimit = self.phaseConfig['timeLimit'] * 1000 # s to ms
			assert self.timeLimit > 1000, "The configured phase time limit " + str(self.timeLimit) + " is less than 1s!"


	@reconstructor
	def init_on_load(self):
		"""When the object is loaded from the database, the constructor is not run again!"""
		self.phaseConfig = self.getPhaseConfig()
		self.logger = self.participant.logger


	def load(self, timeStamp: Union[str, int], tutorialStatus: Dict[str, TutorialStatus]):
		# If this phase got levels, load em
		if self.name in PHASES_WITH_LEVELS:
			self.loadLevels(timeStamp, tutorialStatus)


	# +----------------------------+
	# |       Level Section        |
	# +----------------------------+
	def loadLevels(self, timeStamp: Union[str, int], tutorialStatus: Dict[str, TutorialStatus]):
		"""
		Load all levels which are defined in the level list txt
		(or in the phaseConfig itself, in the case of SkillAssessment)
		
		Warning: Undefined behavior if called on a phase without levels
		"""
		config = self.phaseConfig

		# Special case: Alternative Task
		if self.name == PhaseType.AltTask and 'url' in config:
			# Fallback to the old system, if an url is specified.
			type = 'iframe' if config.get('iframe', False) else 'url'
			self.appendLevel(Level(type, config['url']))

		# Special case: Level Editor
		elif self.name == PhaseType.Editor:
			self.appendLevel(Level('localLevel', 'level_editor_play'))

		# Proceed as usual with the level loading
		else:
			# Sanity check config
			if 'levels' not in config:
				raise ModelFormatError("No levels defined for Phase " + self.name + "!")

			# if the levels list is an array, append all file names, otherwise only append the single file name
			levelListFiles: list[str] = []
			if isinstance(config['levels'], str):
				levelListFiles.append(config['levels'])
			else:
				levelListFiles.extend(config['levels'])

			for lf in levelListFiles:
				shuffle = config.get('shuffle', False) # true | false
				thinkaloud = config.get('thinkaloud', 'no') # "concurrent" | "retrospective" | "no"
				self.__readLevelList(lf, self.name, thinkaloud, shuffle, tutorialStatus)

		# Persist all levels into the DB and force flush, otherwise default params are not initialized
		db.session.add_all(self.levels)
		db.session.flush()

		# Log the event
		level = self.getLevel()
		level.timerLoad(int(timeStamp))

		self.logger.logNewLevel(timeStamp, level.getLogType(), level.getName(), cast(dict[str, int], level.getRandomSwitches()))
		
		event = ChronoEvent(
			clientTime=int(timeStamp),
			serverTime=now(),
			pseudonym=self.pseudonym,
			phase=self.name,
			level=(LevelType(level.type), level.getName()),
			operation='load',
			timerType=level.type,
			context=f"{self.name}/{level.getName()}",
			limit=level.getTimeLimit(),
			annex=self.getAnnex()
		)
		event.commit()


	def appendLevel(self, level: Level):
		"""Append a level to the level list of this phase."""
		assert self.hasLevels(), f"Tried to append a level in {self.name}, which has no Levels!"
		level.levelPosition = len(self.levels)
		self.levels.append(level)


	def insertLevel(self, level: Level, position: int):
		"""Insert a level at the specified index into the level list of this phase."""
		assert self.hasLevels(), f"Tried to insert a level at position {position} in {self.name}, which has no Levels!"
		level.levelPosition = position
		self.levels.insert(position, level)


	def nextLevel(self, timeStamp: Union[str, int]) -> Optional[Level]:
		"""Load the next level (pop/remove the current level from the que)
		
		This basically is the old participant.nextLevel() method
		"""
		if self.name not in PHASES_WITH_LEVELS:
			return None

		if len(self.levels) > 0:
			# If popped level was a task, decrease the number of remaining tasks
			lastLevel = self.getLevel()
			if lastLevel.isTask():
				self.tasksRemaining = max(0, self.tasksRemaining-1)
			
			# Increment the levelIdx, so that `getLevel()` returns the next level
			self.levelIdx += 1

			# Log the event and reset the screenshot counter
			level = self.getLevel()
			level.timerLoad(int(timeStamp))
			self.logger.logNewLevel(timeStamp, level.getLogType(), level.getName(), cast(dict[str, int], level.getRandomSwitches()))
			self.picNmbr = 0

			event = ChronoEvent(
				clientTime=int(timeStamp),
				serverTime=now(),
				pseudonym=self.pseudonym,
				phase=self.name,
				level=(LevelType(level.type), level.getName()),
				operation='load',
				timerType=level.type,
				context=f"{self.name}/{level.getName()}",
				limit=level.getTimeLimit(),
				annex=self.getAnnex()
			)
			event.commit()

			return level

		return None


	def getLevel(self) -> Level:
		"""
		Get the currently active level.

		Warning: This method will raise an exception, if no levels remain. 
		Check beforehand with getRemainingLevels() > 0
		"""
		return self.levels[self.levelIdx]


	def getRemainingLevels(self) -> int:
		"""Get the number of levels, info screens etc. that remain in this phase (includes the currently loaded one). 
		This will be 0 if there is no current level or this phase has no levels.
		"""
		return max(0, len(self.levels) - self.levelIdx)


	def getRemainingTasks(self) -> int:
		"""Get the number of tasks that remain 
		(just levels with Circuits/Alternative tasks, no info screens etc.)
		"""
		return self.tasksRemaining


	def getNumTasks(self) -> int:
		"""Get the number of circuits etc. (not info screens) for this phase
		
		Must be called after the levels where loaded, otherwise this number is zero. Also zero if this
		phase is not in `PHASES_WITH_LEVELS`.
		"""
		return self.numTasks
	

	def getAnnex(self) -> dict[str, Any] | None:
		"""Get the chrono event annex for the new database logger"""
		if not self.hasLevels():
			return {}

		if self.getLevel().hasRandomSwitches():
			return {
				"randSwitches": self.getLevel().getRandomSwitches()
			}
		
		return None
	

	def calculateScore(self) -> int:
		"""Calculate a score from the current phase statistics"""
		point_map = {
			"low": 1,
			"medium": 4,
			"high": 8,
			"guru": 12
		}
		# "difficulty weighted points over time for first-attempt correct solution" metric
		score = 0
		for level in filter(lambda l: l.isTask() and l.confirmClicks == 1 and l.solved, self.levels):
			dir = level.fileName.split("/", 1)[0]
			points = point_map.get(dir, 0)
			time = level.getTimeSpend()/1000
			score += 100*points/max(time, 1)

		return round(score)

	
	def hasLevels(self) -> bool:
		return self.name in PHASES_WITH_LEVELS


	def __readLevelList(self, fileName: str, phaseName: str, thinkaloud: str, shuffle: bool, tutorialStatus: Dict[str, TutorialStatus]) -> None:
		"""Utility function used by loadLevels(), read a level list and add all levels to the que"""
		# get file content for the group the participant is in
		fileContent = getFileLines(Level.getBasePath('levelList'), fileName, encoding=LEVEL_ENCODING)
		fileTypes: list[str] = []
		levelFileNames: list[str] = [] # These might get shuffled if enabled in the config
		infoPanelFileNames: list[str] = [] # These will not be shuffled

		# fill arrays
		for fileData in fileContent:
			type, name = fileData
			
			# Append Level
			if type == 'level':
				# If level info is not found in cache, read the level file
				if name not in Level.levelCache:
					try: 
						Level.levelCache[name] = self.generateCacheEntry(type, name)

					except Exception as e:
						print("Exception while generating level cache: " + str(e), file=sys.stderr)

				# Add concurrent think aloud slide, if configured
				if phaseName == PhaseType.Competition and thinkaloud == 'concurrent':
					infoPanelFileNames.append('thinkaloudCon.txt')
					fileTypes.append('text')
				
				# Add level
				levelFileNames.append(name)
				fileTypes.append(type)

				# Add retrospective think aloud slide, if configured
				if phaseName == PhaseType.Competition and thinkaloud == 'retrospective':
					infoPanelFileNames.append('thinkaloudRet.txt')
					fileTypes.append('text')

			# Append Info Panel
			elif type == 'text':
				infoPanelFileNames.append(name)
				fileTypes.append(type)			

			# Add other stuff, like Tutorial slides or AltTask
			elif type in ALL_LEVEL_TYPES.keys():
				infoPanelFileNames.append(name)
				fileTypes.append(type)

		# Update the tasks counter
		self.numTasks += len(levelFileNames)
		self.tasksRemaining += len(levelFileNames)

		# Randomize / shuffle the level file names if configured 
		if shuffle:
			random.shuffle(levelFileNames)

		# Feed the parsed entries into the new level que system
		for ft in fileTypes:
			fileName = levelFileNames.pop(0) if ft == 'level' else infoPanelFileNames.pop(0)
			self.preLevelInsert(fileName=fileName, fileType=ft, tutorialStatus=tutorialStatus)
			self.appendLevel(Level(ft, fileName))


	def preLevelInsert(self, fileName: str, fileType: str, tutorialStatus: Dict[str, TutorialStatus]):
		# Only insert stuff before levels
		if fileType != 'level':
			return

		# Insert tutorial slides before levels with camouflage / covert gates, if enabled in the config
		if not self.phaseConfig.get('insertTutorials', True):
			return

		if Level.hasGate2(fileName, gate=KEY_COVERT) and KEY_COVERT not in tutorialStatus:
			self.appendLevel(Level('tutorial', KEY_COVERT))
			tutorialStatus[KEY_COVERT] = TutorialStatus(KEY_COVERT) # Mark the covert slide as inserted (not yet shown)

		if Level.hasGate2(fileName, gate=KEY_CAMOUFLAGE) and KEY_CAMOUFLAGE not in tutorialStatus:
			self.appendLevel(Level('tutorial', KEY_CAMOUFLAGE))
			tutorialStatus[KEY_CAMOUFLAGE] = TutorialStatus(KEY_CAMOUFLAGE) # Mark the camou slide as inserted (not yet shown)


	@staticmethod
	def generateCacheEntry(type: str, name: str):
		"""Read in the entire level file once to gather needed information about the level"""
		covert = False
		camouflage = False

		# Look at the level to determine if a covert / camouflage gate is present
		with open(safe_join(Level.getBasePath(type), name), 'r', encoding='UTF-8') as f:
			txt = f.read()
		covert = re.search("^element§[0-9]*§CovertGate§[0-9]§[0-9]*§[0-9]*§(?!camouflaged)", txt, re.MULTILINE) != None
		camouflage = re.search("^element§[0-9]*§CovertGate§[0-9]§[0-9]*§[0-9]*§(camouflaged)", txt, re.MULTILINE) != None
		
		randomSwitches = re.findall("^element§([0-9]*)§Switch§[0-9]§[0-9]*§[0-9]*§random", txt, re.MULTILINE)
		randomSwitches = list(map(int, randomSwitches))

		return CachedLevel(gateCamouflage = camouflage, gateCovert=covert, randomSwitches=randomSwitches)


	# +----------------------------+
	# |       Timer Section        |
	# +----------------------------+

	def setFirstLevelTime(self, clientTime: int) -> bool:
		"""Set the time when the first level of this phase is shown.
		
		This time might be different to `startTime` as the Phase might start with
		info screens. This time is needed by the Phase time limit, as it will start
		after the first Level is shown. (info screens don't count into the time limit)
		"""
		if self.timeFirstLevel > 0:
			return False
		
		self.timeFirstLevel = clientTime
		return True


	def skillAssessment(self) -> Tuple[Union[str, None], int]:
		"""Recommend a new group for the player, based on the score calculated by self.calculateScore()
		
		The required points for each group must be configured inside the gameConfig.json in the groups Skill block.
		"""
		score = 0
		if self.name == PhaseType.Skill:
			score = self.calculateScore()

			# Sanity check config
			if 'groups' not in self.phaseConfig:
				raise ModelFormatError("There was no group specified, where we could jump to after the Skill Assessment!")

			# Assign the player to a group, if the score is >= the required Score
			for groupName, requiredScore in sorted(self.phaseConfig['groups'].items(), key=lambda kv: kv[1], reverse=True):
				if not (isinstance(requiredScore, int) or isinstance(requiredScore, float)):
					raise ModelFormatError("The required score for the skill assessment must be a number (" + groupName + ")")

				if score >= requiredScore:
					print(getShortPseudo(self.pseudonym) + " scored " + str(score) + ", assigning to " + groupName + ".")
					return groupName.casefold(), score

		return None, score


	# +----------------------------+
	# |        Misc Section        |
	# +----------------------------+
	def getPhaseConfig(self) -> dict[str, Any]:
		return self.participant.getConfig().get(self.name, {})
