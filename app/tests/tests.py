#!/usr/bin/env python3

import unittest

import io
from datetime import datetime, timedelta

# Unit tests for statistics.py
from app.statistics import (parseTime, readLogfile, LogSyntaxError, generateStatistics, getLevelsForGroup, 
						groups, tableHeader, levelHeader, TABLE_DELIMITER, timeDifference, removesuffix, 
						LEVEL_TIME_SPENT, LEVEL_N_SWITCH_CLICKS, LEVEL_N_CONFIRM_CLICKS, GENERAL_COMPLEXITY, 
						LEVE_TIME_FIRST_TRY)

testLogLocation = "statistics/LogFiles"
testLogs = []

NUM_QUALI = 3
NUM_COMPE = 8

class TestStatistics(unittest.TestCase):

	def test_timeParser(self):
		"""Test the time parser that is used to convert the time string to datetime objects"""
		self.assertEqual(parseTime("下午9:39:59"), datetime.strptime("21:39:59", "%H:%M:%S"))
		self.assertEqual(parseTime("上午10:11:12"), datetime.strptime("10:11:12", "%H:%M:%S"))
		self.assertEqual(parseTime("3:40:49 PM"), datetime.strptime("15:40:49", "%H:%M:%S"))
		self.assertEqual(parseTime("0:0:0"), datetime.strptime("00:00:00", "%H:%M:%S"))

		self.assertEqual(parseTime("1645043162740"), datetime(2022, 2, 16, 21, 26, 2, 740000)) # 20:26:02 GMT, or 21:26:02 CET

		with self.assertRaises((ValueError, LogSyntaxError)):
			parseTime("foo")


	def test_timeFunctions(self):
		"""Sanity check the imported time functions"""
		self.assertEqual(datetime.strptime("00:00:00", "%H:%M:%S"), datetime.strptime("00:00:00", "%H:%M:%S"))


	def test_timeDiff(self):
		"""Test the time difference function, which will return the time passed between two events in seconds"""
		jetzt = datetime.now()
		zukunft = jetzt + timedelta(0, 3)
		self.assertEqual((zukunft - jetzt).total_seconds(), timeDifference(jetzt, zukunft))
		self.assertEqual(timeDifference(datetime.strptime("00:10:00", "%H:%M:%S"), datetime.strptime("00:10:00", "%H:%M:%S")), 0)
		self.assertEqual(timeDifference(datetime.strptime("00:00:00", "%H:%M:%S"), datetime.strptime("00:00:06", "%H:%M:%S")), 6)
		self.assertEqual(timeDifference(parseTime("1645043162740"), parseTime("1645043168740")), 6)
		self.assertEqual(timeDifference(parseTime("19:50:59"), parseTime("19:52:33")), 94)
		

	def test_logReader(self):
		"""
		Test that the logfile parser gets the main parameters like timings and clicks right. 
		This function will only work with complete logfiles, as this is basically an oversimplified logfile parser
		"""
		groups["low"]["namesQuali"] = getLevelsForGroup("levels_quali.txt")
		groups["low"]["namesCompetition"] = getLevelsForGroup(groups["low"]["levelFile"])
		groups["medium"]["namesQuali"] = getLevelsForGroup("levels_quali.txt")
		groups["medium"]["namesCompetition"] = getLevelsForGroup(groups["medium"]["levelFile"])
		groups["high"]["namesQuali"] = getLevelsForGroup("levels_quali.txt")
		groups["high"]["namesCompetition"] = getLevelsForGroup(groups["high"]["levelFile"])
		groups["expert"]["namesQuali"] = getLevelsForGroup("levels_quali.txt")
		groups["expert"]["namesCompetition"] = getLevelsForGroup(groups["expert"]["levelFile"])

		logFiles = [
			"logFile_0ea73b324403d1f4f1d4f82c77af299170e27e8a14a5cbcaa71e9d70baff3c54.txt",
			"logFile_1e10e726fe5ff1d2505ea965759a6bdbdd8893f2427b6f0591ff9f0b5a5f4408.txt",
			"logFile_cc9c9173c411d3af674b1bed2e644b2604b2ed629cb467691c15c7dd3a1bbaf1.txt",
			"logFile_bdf52678787044c70d8c7c049680594cb91162fe0cec7ca2c10d0bd0d63090e3.txt",
			"logFile_0e512da6e6c090202805a09492beeea497132cd4c3b610868db6dbbd1f6a5cf9.txt"
		]

		# --- write table header ---
		csvTableHead = ""
		writeComma = False
		for th in tableHeader:
			if writeComma: 
				csvTableHead += TABLE_DELIMITER
			else:
				writeComma = True
			csvTableHead += th

		for i in range(0, NUM_QUALI+NUM_COMPE): #TODO maxLevelsQuali + maxLevelsCompetition): 
			for th in levelHeader:
				csvTableHead += TABLE_DELIMITER
				csvTableHead += th + " (" + str(i+1) + ")"

		csvTableHead += '\n'

		for lf in logFiles:
			print(lf, flush=True)
			csvFile = io.StringIO("")
			csvFile.write(csvTableHead)

			events, ui = readLogfile(testLogLocation, lf)

			group = None
			levelNames = []

			levelTimes = []
			levelSwitchClicks = []
			levelConfirmClicks = []

			currentLevel = None
			currentScene = None
			startTime = None

			for e in events:
				if {"Event": "Group Assignment"}.items() <= e.items():
					group = e["Group"]
					levelNames.extend(groups[group]["namesQuali"])
					levelNames.extend(groups[group]["namesCompetition"])

				elif {"Event": "change in Scene"}.items() <= e.items():
					currentScene = e["Scene"]
					if currentScene == "IntroduceElements": 
						levelTimes = [None] * (NUM_QUALI + NUM_COMPE)
						levelSwitchClicks = [0] * (NUM_QUALI + NUM_COMPE)
						levelConfirmClicks = [0] * (NUM_QUALI + NUM_COMPE)

				elif currentScene == "Quali" or currentScene == "Competition":
					if {"Event": "new Level"}.items() <= e.items():
						startTime = e["time"]
						currentLevel = levelNames.index(removesuffix(e["Filename"], ".txt"))

					elif {"Event": "Click", "Object": "Switch"}.items() <= e.items():
						levelSwitchClicks[currentLevel] += 1

					elif {"Event": "Click", "Object": "Skip-Level Button", "Consequence Event": "Current level is being skipped"}.items() <= e.items():
						levelTimes[currentLevel] = timeDifference(startTime, e["time"])

					elif {"Event": "Click", "Object": "ConfirmButton"}.items() <= e.items():
						levelConfirmClicks[currentLevel] += 1

						if e["Level Solved"] == "1":
							levelTimes[currentLevel] = timeDifference(startTime, e["time"])

			generateStatistics(events, csvFile, ui)

			#print(ui, levelTimes, "Time comp:", sum(levelTimes, NUM_QUALI))

			csvFile.flush()
			csvFile.seek(0)
			#print(csvFile.read())

			generatedCSV = []
			generatedTimings = []
			generatedSwitchClicks = []
			generatedConfirmClicks = []
			generatedTimingsFirstTry = []
			
			# read the values from the generated csv
			for line in csvFile.readlines():
				generatedCSV.append(line.split(','))

			# grab the generated level times
			for i in range(0, len(levelTimes)):
				index = generatedCSV[0].index(LEVEL_TIME_SPENT + " (" + str(i+1) + ")")
				val = float(generatedCSV[1][index])
				generatedTimings.append(val)

				# If the level took longer than 1 hour something is really wrong (might also be inside the parseTime or timeDifference function), 
				# as the logfile will be closed after 20min
				self.assertLess(val, 3600)

			# grab the generated switch clicks
			for i in range(0, len(levelSwitchClicks)):
				index = generatedCSV[0].index(LEVEL_N_SWITCH_CLICKS + " (" + str(i+1) + ")")
				generatedSwitchClicks.append(int(generatedCSV[1][index]))

			# grab the generated confirm clicks
			for i in range(0, len(levelConfirmClicks)):
				index = generatedCSV[0].index(LEVEL_N_CONFIRM_CLICKS + " (" + str(i+1) + ")")
				generatedConfirmClicks.append(int(generatedCSV[1][index]))

			# grab the generated first try level times
			for i in range(0, len(levelTimes)):
				index = generatedCSV[0].index(LEVE_TIME_FIRST_TRY + " (" + str(i+1) + ")")
				val = float(generatedCSV[1][index])
				generatedTimingsFirstTry.append(val)

				# If the user pressed confirm once, the time to first try should be equal with the level time and less otherwise
				if generatedConfirmClicks[i] > 1:
					self.assertLess(val, generatedTimings[i])
				else:
					self.assertEqual(val, generatedTimings[i])

			#print(generatedTimings)
			csvFile.close()

			# assert that the generated stuff from statistics.py matches the crude level parser implemented in this verification script
			self.assertEqual(group, generatedCSV[1][generatedCSV[0].index(GENERAL_COMPLEXITY)])
			self.assertListEqual(levelTimes, generatedTimings)
			self.assertListEqual(levelSwitchClicks, generatedSwitchClicks)
			self.assertListEqual(levelConfirmClicks, generatedConfirmClicks)


if __name__ == '__main__':
	unittest.main()