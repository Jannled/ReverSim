---
pagetitle: 'Documentation: Statistics Tool'
lang: en
created: 2023-10-06 18:45
---

> [!NOTE]\
> This document is work in progress. If you need help, feel free to [contact us](GettingStarted.md#your-feedback).

# Documentation Statistics Tool
> [!WARNING]\
> The statistics tool is currently not hardened against [CSV injections](https://cwe.mitre.org/data/definitions/1236.html). Treat all resulting files with care.

The statistics tool allows you to convert the log files that contain a time series to a csv which contains selected information on a per level basis.

The easiest way to use this tool is with the VS Codes _Run and Debug_ feature to select HRE Game Statistics target, which will guide you through most of the command options. But you can also run it manually:

```bash
python -m app.statistics.statistics2 -p statistics
```

```
usage: statistics2.py [-h] [-l LOG] [-d] [-p LOGPATH] [-o OUTPUT] [-s] [--folderLogs FOLDERLOGS] [--folderPics FOLDERPICS] [--config CONFIG] csvGenerator

positional arguments:
  csvGenerator          The script to be used to generate the csv file. "app/statistics/csvGenerators/"

options:
  -h, --help            show this help message and exit
  -l LOG, --log LOG     Specify the log level, must be one of DEBUG, INFO, WARNING, ERROR or CRITICAL
  -d, --allowDebug      Allow debug groups to end up in the output
  -p LOGPATH, --logPath LOGPATH
                        The path to search for the logfiles
  -o OUTPUT, --output OUTPUT
                        The filename of the output statistic csv file
  -s, --skipScreenshots
                        Skip the screenshot validation
  --folderLogs FOLDERLOGS
                        Skip the screenshot validation
  --folderPics FOLDERPICS
                        Skip the screenshot validation
  --config CONFIG       Additional instructions for the log parser (merging, vip logs etc.)
```

## Workflow
The tool will read all the contents of files with the format `logFile_{pseudonym}.txt` and creates a `StatsParticipant` object for every log file.

## CSV Generators
```python
from typing import Callable, List, Union
from app.statistics.csvFile import LEVEL_ATTRIB_T, getLevelAttributes
from app.statistics.statsParticipant import StatsParticipant
from app.statistics.statsPhase import StatsPhase
from app.statistics.statsLevel import StatsLevel

LEVEL_HEADER_FORMAT = "%(th)s (%(globalIdx)d)"

groupFilter = ['easy']

header: List[str] = []

levelHeader: List[str] = []

attributes: List[Callable[[StatsParticipant], Union[str, bool, float, int, None, List[LEVEL_ATTRIB_T]]]] = []

levelAttributes: List[Callable[[StatsParticipant, StatsPhase, StatsLevel], LEVEL_ATTRIB_T]] = []
```

### Statistic Tool Config
```json
{
	"vip": [
		"PSEUDONYM",
		"PSEUDONYM",
	],
	"stitch": {}
}
```
