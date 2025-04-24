import logging
from typing import TYPE_CHECKING, Optional
from app.statistics.staticConfig import ENABLE_SPECIAL_CASES, EVENT_T, GAME_INTRO_PHASES, EventNames
from app.utilsGame import LogKeys, PhaseType, getShortPseudo

if TYPE_CHECKING:
	from app.statistics.activeLogfile import LogfileInfo
	from app.statistics.altTasks.zvt import ZVT_Task
	from app.statistics.statsLevel import StatsLevel
	from app.statistics.statsParticipant import StatsParticipant
	from app.statistics.statsPhase import INTRO_SLIDE_NAMES_OLD, StatsPhase


# 1. In older logfiles, Infos might miss the load event (v0.1.0).
# 2. In older logfiles, the user also had to repeat the IntroduceDrawingTools after a failed Quali attempt.
# 3. Since the Confirm Click event and the Level Solved Feedback Dialogue are fired at the same time, the order might be messed up.
# 4. The minimum switch clicks is wrong in levels where one switch is already enabled
# 5. The confirm click when the level is solved is missing in some logs
# 6. The grid numbers in the ZVT alternative task are offset by -1 (-1 should be 0, 0 should be 1, etc)
# 7. The debug prefix is swallowed and therefore is wrong in the group assignment event. But maybe it can be parsed from the redirect event.
# 8. In older logfiles, the info events might be missing entirely
# 9. In older logfiles, the fail quali event will use a confirm click in the frontend to update the ui, which should not but does end up in the log
# 10. In older logfiles, the new Level (level load) is not followed by a started level event (v0.1.0)
# 11. The GameIntro is not reported anymore, since the pseudonym is generated after clicking play (v0.6.6b)
# 12. The covert/camou slides had no `new SlideName` event and only `Tutorial covert` and `Tutorial camouflage` in the level-type field of `loaded` event (v0.)

# The special cases where refactored in this file, to make removal easier later
# When removing also take care of statsParticipant.py:38
# > # stuff for special case 12:
# >		self.legacyIntros = False
# >		self.tempLevelStorage: Optional[StatsLevel] = None


def specialCase1(participant: 'StatsParticipant', event: EVENT_T):
	"""Special case 01: In older logfiles, Infos might miss the load event"""
	if True: #not ENABLE_SPECIAL_CASES:
		return
	
	MAJOR, MINOR, PATCH = LogfileInfo.getActive().version.split('.', 3)
	cp = participant.getCurrentPhase()

	if int(MAJOR) < 1 and event['Type'] == 'Info' and cp.levelCounter >= 0 and cp.levels[cp.levelCounter].type == 'info':
		logging.debug("Special case 01: Load missing for " + cp.levels[cp.levelCounter].name)
		cp.onLevelRequested({ # Call the new Info event
			'Time': event['Time'],
			'Event': 'new Info',
			'Filename': cp.levels[cp.levelCounter].name
		})


def specialCase2(participant: 'StatsParticipant', expectedPhase: 'StatsPhase', newPhaseName: str):
	"""Special case 02: In older logfiles, the user also had to repeat the IntroduceDrawingTools after a failed Quali attempt"""
	from app.statistics.statsPhase import StatsPhase

	if not ENABLE_SPECIAL_CASES:
		return
	
	if newPhaseName == PhaseType.DrawTools and expectedPhase.name == PhaseType.Quali and expectedPhase.stats['dynamic'] in [1, True]:
		logging.debug("Special case 02: Player repeated IntroDrawingTools")
		expectedPhase = StatsPhase(PhaseType.DrawTools, participant.conf, dynamic=True)
		participant.statsPhase.insert(participant.currentPhase, expectedPhase)


def specialCase3_5_8_10(participant: 'StatsParticipant', log: list[EVENT_T], event: EVENT_T, i: int, version: str):
	"""Special case 3, 5, 8 and 10
	
	- 03: Fix the order of the Confirm Click solved and Level Feedback dialogue
	- 05: The confirm click went missing in some logs, inject it first
	- 08: Inserting the two Quali/Competition Infos after event 
	- 10: Inserting Level-STARTED/LOAD_FINISHED after event
	"""

	if not ENABLE_SPECIAL_CASES:
		return
	
	# Special case 03 and 05
	if EventNames.POPUP_CLICK_FEEDBACK.items() <= event.items() \
				and not participant.getCurrentLevel().isSolved():
		confirmEvent = next((v for v in log[i+1:i+3] if EventNames.CLICK_CONFIRM.items() <= v.items()), None)

		if confirmEvent != None:
			# Special case 03: Fix the order of the Confirm Click solved and Level Feedback dialogue
			logging.debug("Special case 03: Reordered Level Solved and Confirm Click!")
			confirmEvent['_originLine'] = -103
			participant.handleEvent(confirmEvent)
		
		# On quali failed, there might not be a confirm click
		elif next((v for v in log[i-3:i+5] if v["Event"].startswith("Failing")), None) == None:
			# Special case 05: The confirm click went missing in some logs, inject it first
			logging.debug("Special case 05: Injected missing Confirm Click")
			confirmEvent = {
				**EventNames.CLICK_CONFIRM.value,
				'_originLine': -105,
				'Time': event['Time'],
				'Level Solved': "True"
			}
			participant.handleEvent(confirmEvent)

	# Special case 08
	if version == '0.1.0' and EventNames.CHANGE_SCENE.items() <= event.items() and len(log) > i+1:
		assert isinstance(event['Scene'], str), "Scene is missing"
		ne = log[i+1].items() 
		if event['Scene'] == PhaseType.Quali and not (
				{**EventNames.STARTED.value, 'Type': 'Info'}.items() <= ne 
				or EventNames.LOAD_INFO.items() <= ne):
			logging.debug("Special case 08: Inserting the two Quali Infos after event " + str(i) + "!")
			log.insert(i+1, {
				'Time': event['Time'],
				'_originLine': -8,
				'Event': 'Loaded',
				'Type': 'Info'
			})
			log.insert(i+2, {
				'Time': event['Time'],
				'_originLine': -8,
				'Event': 'Loaded',
				'Type': 'Info'
			})
		
		elif event['Scene'] == PhaseType.Competition and not (
				{**EventNames.STARTED.value, 'Type': 'Info'}.items() <= ne 
				or EventNames.LOAD_INFO.items() <= ne):
			logging.debug("Special case 08: Inserting Competition Info after event " + str(i) + "!")
			log.insert(i+1, {
				'Time': event['Time'],
				'_originLine': -8,
				'Event': 'Loaded',
				'Type': 'Info'
			})
	
	# Special case 10
	if version == '0.1.0' and EventNames.LOAD_LEVEL.items() <= event.items() and len(log) > i+1:
		# See if a load is within the next 5 events. Not 100% bulletproof.
		lookahead = log[i+1 : i+6]

		# If no load is found, insert it
		if not any(EventNames.STARTED.items() <= x.items() for x in lookahead):
			logging.debug("Special case 10: Inserting Level-STARTED/LOAD_FINISHED after event " + str(i) + "!")
			log.insert(i+1, {
				'Time': event['Time'],
				'_originLine': -10,
				'Event': 'Loaded',
				'Type': 'Level'
			})


def specialCase4() -> bool:
	"""Well due to an error in the client code, this will (in-)correctly filter out some logs."""
	if not ENABLE_SPECIAL_CASES:
		return False

	logging.debug("Special case 04: Somehow the user managed to click fewer switches than required!")
	return True


def specialCase6(task: 'ZVT_Task', currentGrid: int):
	"""Special Case 06: Apply offset to mitigate the grid numbers starting with -1"""
	assert task.altTask != None

	if currentGrid < 0 and ENABLE_SPECIAL_CASES:
		task.altTask['offsetCorrection'] = 0 - currentGrid
		logging.debug('Special case 06: The offset is ' + str(task.altTask['offsetCorrection']))


def specialCase7(log: list[EVENT_T], version: str, pseudonym: str, group: Optional[str]):
	""" Special case 07: The debug prefix is swallowed and therefore is wrong in the group assignment event.
	
	Try to parse it from the redirect event.
	"""
	if not ENABLE_SPECIAL_CASES:
		return

	for i in range(0, min(9, len(log))):
		if log[i][LogKeys.EVENT] == "Redirect":
			# Use splits to parse the Query params /game?group=debugLow&onsite=1&ui=2355fd609d5d2 ...
			dest: str = log[i]['Destination'].split('?', 1)[1] 
			params = dest.split('&')
			for kv in params:
				if kv.startswith('group'):
					secGroup = kv.split('=', 1)[1].casefold()
					if secGroup != group:
						logging.debug("Special case 07: Group for " + getShortPseudo(pseudonym) + " in redirect '" + secGroup + \
								"' does not match group assignment '" + str(group) + "'!")

						if group is None:
							logging.warning("The group assignment is missing from the logs, assuming '" + secGroup + "' (v" + version + ")!")
							group = secGroup
						elif secGroup.startswith('debug') and secGroup.casefold() != 'debug':
							group = 'debug' + str(group)
					break
			break

	return group


def specialCase9(level: 'StatsLevel', event: EVENT_T) -> bool:
	"""Special case 09: The confirm clicks reported by the client are correct, use them"""
	if not ENABLE_SPECIAL_CASES:
		return False
	
	if LogfileInfo.getActive().version == '0.1.0' and level.name in ['alow_00000001', 'blow_00001000_v2', 'clow_11111101']:
		logging.debug("Special case 09: Overriding {} with {} in level {}" \
				.format(str(level.stats['confirmClicks']), str(event['Nmbr Confirm Clicks']), level.name))
		level.stats['confirmClicks'] = int(event["Nmbr Confirm Clicks"])

		return True

	return False


def specialCase11(participant: 'StatsParticipant', newPhaseName: str):
	"""Special case 11: GameIntro is not added to log due to privacy concerns"""
	if not ENABLE_SPECIAL_CASES:
		return
	
	if newPhaseName in GAME_INTRO_PHASES:
		logging.debug("Special case 11: Skipping over phase " + newPhaseName + " in log.")
		participant.phasesStarted.append(newPhaseName)
		return


def specialCase12(participant: 'StatsParticipant', event: EVENT_T):
	"""Special case 12: slide name in type field
	
	Skip camouflage/covert intro slides
	In new log format these are 'tutorial' and 'covert', in the old 
	"""
	if not ENABLE_SPECIAL_CASES:
		return

	levelType: str = event[LogKeys.TYPE]

	if levelType in INTRO_SLIDE_NAMES_OLD.keys():
		participant.legacyIntros = True
		participant.tempLevelStorage = participant.getCurrentPhase().currentLevel
		logging.debug("Special case 12: Legacy covert/camou intro slide")

		# Dynamically insert covert/camouflage intro
		level = StatsLevel('tutorial', INTRO_SLIDE_NAMES_OLD[levelType])
		level.onLoad(event, participant.getCurrentPhase().levelCounter)
		participant.getCurrentPhase().currentLevel = level
		event[LogKeys.TYPE] = 'tutorial'

	# Special case 12: bring back the old level
	elif participant.legacyIntros and participant.getCurrentLevel().type == 'tutorial' and participant.tempLevelStorage != None:
		participant.getCurrentPhase().currentLevel = participant.tempLevelStorage
		participant.tempLevelStorage = None
