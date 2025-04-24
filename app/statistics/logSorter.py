import argparse
import ntpath
import os
from typing import Any, List, OrderedDict

# Max Logfile Size in Bytes (Currently 20MB)
MAX_LOGFILE_SIZE = 1024 * 1024 * 20

def sortFile(path: str):
	fileName = ntpath.basename(path)
	fn, fe = ntpath.splitext(fileName)
	folderName = ntpath.dirname(path)

	print('Reading "' + path + '".')

	# Warn if we think the file might be wrong
	if not fileName.startswith("logFile_"):
		print('Warning: the filename does not start with "logFile_"')

	# Sanity check file size
	if os.path.getsize(path) > MAX_LOGFILE_SIZE:
		raise RuntimeError("Error: The file \"" + path + "\" is way too big!")
	
	# Read a single file into a python array containing dict entries
	parsedFile = parseLogfile(path)

	fixGroupAssignmentTime(parsedFile)

	# Sort the file
	sortedFile = sorted(parsedFile, key=lambda x: x['Time'])

	newFileName = os.path.join(folderName, fn + "_sorted" + fe)
	print('Writing sorted logFile to "' + newFileName + '".')

	# Write the new now sorted file to disk
	with open(newFileName, mode="w", encoding="utf-8") as f:
		f.write('\n')
		for event in sortedFile:
			if "Version" in event:
				event["Sorted"] = "True"

			for entry in event.items():
				assert(len(entry) == 2)
				if entry[0] == "Time":
					line = entry[0] + ": " + str(entry[1])
				else:
					line = "§" + entry[0] + ": " + entry[1]
				f.write(line + '\n')
			f.write('\n')


def fixGroupAssignmentTime(parsedFile: List[OrderedDict[str, Any]]):
	# Special case: The group Assignment time might be off
	tCreation = 0
	tScore = 0

	for e in parsedFile:
		if e["Event"] == "Created Logfile":
			tCreation = int(e["Time"])

		elif e["Event"] == "SkillAssessment":
			tScore = int(e["Time"])
		
		elif e["Event"] == "Group Assignment":
			if int(e["Time"]) < tCreation:
				e["Time"] = tCreation if tScore < 1 else tScore


def parseLogfile(filePath: str) -> List[OrderedDict[str, Any]]:
	parsedFile: List[OrderedDict[str, Any]] = []

	with open(filePath, mode="r", encoding="utf-8") as f:
		event: OrderedDict[str, Any] = OrderedDict()

		for line in f:
			if line.startswith(('\r', '\n')):
				if len(event) > 0:
					assert 'Time' in event and 'Event' in event, str(event)
					parsedFile.append(event)
					event = OrderedDict()

				continue

			key, value = line.strip('§').split(':', 1)
			key = key.strip()
			value = value.lstrip().rstrip('\n\r')
			event[key] = int(value) if key == 'Time' else value

		# Dump the last entry
		if 'Time' in event and 'Event' in event:
			parsedFile.append(event)

	return parsedFile


if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument("path", help="The path to the logFile that should get sorted.")

	args = parser.parse_args()
	sortFile(args.path)
