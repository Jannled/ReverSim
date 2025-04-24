import logging
import os
from typing import Dict, List, Tuple

from app.statistics.statsParticipant import StatsParticipant
from app.utilsGame import PhaseType, getShortPseudo


def countScreenshotsOnDisk(screenshotFolder: str, pseudonym: str, subFolderName: str = 'canvasPics'):
	"""Count the number of screenshots per level/phase found under `../canvasPics/<pseudonym>` 
	
	Returns a list of tuples `(<phaseName/levelName>, <picCount>)` with `levelName` being `.` if this screenshot is not
	inside a level folder but in the root of the phase folder.

	This method operates on files and does not catch the exceptions that might arise (resources are of cause cleaned up)
	"""
	folderUserPics = os.path.join(screenshotFolder, "..", subFolderName, pseudonym)

	picCounts: Dict[str, int] = {}

	# List contents of the User folder (should be one folder per Phase)
	with os.scandir(folderUserPics) as userFolderIterator:
		for folderPhase in userFolderIterator:
			phaseName = folderPhase.name
			phaseName = phaseName.replace('IntroDrawingTools', PhaseType.DrawTools) # Special case for old logfiles

			picCount, levelFolders = countFiles(folderPhase)
			picCounts[phaseName + "/."] = picCount

			# List contents of the Phase folder (should be one folder per level or some pics if the phase has no levels)
			for level in levelFolders:
				levelPicCount, secondRunFolders = countFiles(level)

				LEVEL_NAME = phaseName + "/" + level.name
				picCounts[LEVEL_NAME] = levelPicCount

				# The second runs for the quali phase ended up inside the level folder, this is not intended but we
				# have to work with it now
				for secondLevelRun in secondRunFolders:
					slrPicCount, otherDirs = countFiles(secondLevelRun)
					SECOND_LEVEL_RUN_NAME = phaseName + "/" + level.name + secondLevelRun.name
					picCounts[SECOND_LEVEL_RUN_NAME] = slrPicCount

					if len(otherDirs) > 0:
						logging.warning('Additional folder inside second level run folder: "' + secondLevelRun.path + '"')
	
	return picCounts


def countScreenshotsInLog(playerStats: StatsParticipant):
	targets: Dict[str, int] = {}

	# Generate a list of all expected screenshots from the logs
	for phaseStatistics in playerStats.statsPhase:
		PHASE_NAME = phaseStatistics.name + "/."

		if PHASE_NAME in targets and targets[PHASE_NAME] != 0:
			logging.warning("COMPLAINING")
		targets[PHASE_NAME] = 0 if phaseStatistics.hasLevels() else phaseStatistics.stats['drawn']

		for levelStatistics in phaseStatistics.levels:
			LEVEL_NAME = phaseStatistics.name + "/" + levelStatistics.name.removesuffix('.txt').replace('/', '_')
			currentEntry = LEVEL_NAME

			if currentEntry in targets:
				for i in range(1, len(targets)):
					currentEntry = LEVEL_NAME + '_' + str(i)
					if currentEntry not in targets:
						break
			
			assert isinstance(levelStatistics.stats['drawn'], int) 
			assert isinstance(levelStatistics.stats['switchClicks'], int)
			levelPicCounts: int = levelStatistics.stats['drawn'] + levelStatistics.stats['switchClicks']
			if levelPicCounts > 0:
				targets[currentEntry] = levelPicCounts

	return targets


def countFiles(path: os.DirEntry[str]) -> Tuple[int, List[os.DirEntry[str]]]:
	"""Count all files, return all folders"""
	folderList: List[os.DirEntry[str]] = []
	fileCount = 0

	with os.scandir(path) as it:
		for picOrFolder in it:
			if picOrFolder.is_file():
				fileCount += 1
			elif picOrFolder.is_dir():
				folderList.append(picOrFolder)

	return fileCount, folderList


def checkScreenshots(allPicsOnDisk: Dict[str, int], allPicsInLog: Dict[str, int], playerStats: StatsParticipant):
	""""""
	# Compare every screenshot target from the log with the pics found on disc
	for currentEntry in allPicsInLog:
		if allPicsInLog[currentEntry] == 0:
			continue # Skip over targets with no screenshots in the log
		
		# 
		picsOnDisk: int = allPicsOnDisk[currentEntry] if currentEntry in allPicsOnDisk else 0
		if picsOnDisk != allPicsInLog[currentEntry]:
			logging.warning("[Screenshots] " + getShortPseudo(playerStats.pseudonym) + ' "' + currentEntry + 
				'": ' + str(picsOnDisk) + '/' + str(allPicsInLog[currentEntry]) + ' (on disk/logged)' 
			)