---
created: 2025-01-16 16:13
pagetitle: 'Documentation: Level Screenshot Generator'
lang: en
---

# The ReverSim Level Screenshot Generator
This script provides an easy and automated way to create screenshots of your levels created for the [ReverSim](https://github.com/emsec/ReverSim) game.

To achieve this, the script will connect to a running instance of the game server using [Playwright](https://playwright.dev/python/) to control a windowless browser. 

## Dependencies
This script depends on the config parser and some utils from the ReverSim game and therefore can't be extracted from the [games repository](https://github.com/emsec/ReverSim). 

Additionally you need to install Playwright, this can easily be done with `pip install playwright` or by installing all development dependencies for this project with `pip install -r requirementsDev.txt`. Afterwards you might need to run `playwright install` to download the dependencies playwright needs to talk to different browser engines. 

## Run
This script will connect to a running instance of the ReverSim server (`localhost` by default). Therefore this tool needs a pseudonym like every other player. To prevent your database from getting filled with single use pseudonyms for every run of the script, you must provide it with a pseudonym. The group for the generated pseudonym must contain only one scene of type `LevelViewer` (with the default config, this will be the _Level Viewer_/_viewer_ group). You can copy the pseudonym from the `ui` parameter in the url of the browser window (e.g. [/game?group=viewer&ui={YOUR_32_CHAR_PSEUDONYM_BASE_16}](.), ignore the ~7 character string in the bottom left as this is the game version).

To start the screenshot tool with VS Code, navigate to the _Run and Debug_ Toolbar and select the _Level Screenshots_ Launch target. A prompt will open asking you for the pseudonym you generated earlier.

> [!TIP]  
> You can add the pseudonym you just created directly to a VS Code launch task, so you don't have to reenter it every time, or pass additional parameters to the script.
> To do so, add the following block inside the `"launch"` configuration in your [user settings](https://code.visualstudio.com/docs/getstarted/settings):
> 
> ```json
> {
> 	"name": "Level Screenshots",
> 	"type": "debugpy",
> 	"request": "launch",
> 	"module": "app.screenshotGenerator",
> 	"justMyCode": true,
> 	"console": "integratedTerminal",
> 	"args": [
> 		"{YOUR_32_CHAR_PSEUDONYM_BASE_16}"
> 	]
> },
> ```

You can also use the screenshot tool from the command line, for this the command prompt must be pointed in the root of the ReverSim repository (should be the case by default). This is especially useful to list all available shell arguments:

```bash
$ python -m app.screenshotGenerator --help

usage: screenshotGenerator.py [-h] [-l LEVEL] [-b BASE_URL] [-o OUTPUT] [-g GROUP | -p PATH] pseudonym

This script generates screenshots for all ReverSim Levels you provide.

positional arguments:
  pseudonym             A pregenerated pseudonym that was assigned to a group with the viewer scene.

options:
  -h, --help            show this help message and exit
  -l LEVEL, --log LEVEL
                        Specify the log level, must be one of DEBUG, INFO, WARNING, ERROR or CRITICAL
  -b BASE_URL, --base-url BASE_URL
                        The url of a running instance of the game. Defaults to localhost. Since the server loads the level lists from disk and does not request them from the server, this   
                        will rarely be changed.
  -o OUTPUT, --output OUTPUT
                        The output folder where the screenshots and Markdown/JSON Index will be written to. Defaults to "doc/levels"
  -g GROUP, --group GROUP
                        Include all levels from this group in the output. Repeat this option to add multiple groups.
  -p PATH, --path PATH  Generate the output from all levels in this folder. Defaults to "examples/conf/assets/levels/differentComplexityLevels"
```
