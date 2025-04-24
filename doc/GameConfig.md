---
pagetitle: 'Documentation: Game Config'
lang: en

# NOTE: All json5 code blocks should be jsonl, but this type is not recognized by
#       Visual Studio Code
---

# Documentation for the gameConfig.json file
This file allows you to configure the game itself, you can set up groups and their corresponding rules. This however is only the game part. To configure the underlying web server, please refer to `reversim_uwsgi.ini` instead.
You can see [instance/conf/gameConfig.json](GameConfig.md) and [examples/conf/reversim_uwsgi.ini](/examples/conf/reversim_uwsgi.ini) as example files (these are the default config files for the Docker container).

| Term        | Meaning |
| ----------- | ------- |
| [group](#groups)       | You can divide your participant into different groups, to let them play them different levels or even phases. Players can be automatically assigned to a group, or you can give them a custom link to a specific group. See the [chapter groups](#groups) for more details. |
| [gamerule](#gamerules)    | Customize survey links, the score for errors, etc. Gamerules can be shared between groups. |
| [game option](#game-options) | These are global config variables, that apply to the entire game, no matter what group is active. |


The general file structure for the `gameConfig.json` file looks as follows:
```jsonc
{
	// See chapter Game Options
	"crashReportLevel": 2,
	"languages": ["en", "de"],
	"author": "Your Institution",
	"footer": {
		"impressum": "",
		"research": "assets/researchInfo/researchInfo.html",
		"privacy": "",
	},
	"groupIndex": {
		"enabled": true,
		"showDebug": true,
		"footer": "© {author} | {year}",
	},

	"gamerules": {
		// See chapter Gamerules
	},

	"groups": {
		// See chapter Groups
	}
}
```

Most config keys are optional and have reasonable default values. The default value is given
in the code snippet for each key. The keys that have no default values are marked with 
`// Required`.

## Game Options
### assetPath
```json5
"assetPath": "conf/assets"
```

The folder where all customizable files like levels, info screens, the languageLibrary, etc. lives. 
The game is delivered with a default languageLibrary in german and english and some example levels. The [folder structure](conf/assets/Readme.md) inside assets is not customizable (for the most part), however you can use subfolders to organize your files.

The file path is relative to the base directory of ReverSim (the folder gameServer.py resides in).

### languages
```json5
"languages": ["en", "de"] // Required
```
A list of languages this game supports. Please make sure that you have translated the entire game (languageDict, etc), see the [Translation Guide](./Translating.md) for further information.

If no language is manually set with the request parameter (e.g. [/welcome?lang=de](/welcome?lang=de)) and the automatic guess fails, the game will fall back to the first value in this list.

### author 
```json5
"author": ""
```
The name of **your** institution. Will be set in the `<head>` of the game as `<meta name="author" content="{author}">` and if configured in the [footer](#footer-groupindex) of the group index as well.

### crashReportLevel
```json5
"crashReportLevel": 2, // Required
```
Server side errors are logged as you would expect, but errors on the player/client side are not and therefore hard to understand and reproduce. Therefore you can enable the client to POST error messages to [/crashReport](.).
For exceptions the full stack trace will be included. 
Only the scripts that are needed for the current log level are transmitted to the player. See [crashReportBlacklist](#crashreportblacklist) if you wan't to disable error logging only for certain groups (Log-level `0`).

| Error Level   | Explanation                                                                |
| --- | ------------------------------------------------------------------------------------ |
| `0` | Client side errors are not send to the server, the crash_report.txt file is not open |
| `1` | Only log unhandled exceptions (exceptions that escaped into the browser)             |
| `2` | Additionally tap into `console.error()` calls and write them to log                  |

### crashReportBlacklist
```json5
"crashReportBlacklist": []
```
All groups on this list will be excluded from the error logger. 
If you leave the list empty or omit this key entirely, all groups with [enableLogging](#enablelogging)=false in their gamerules will be added to this list.

### footer
```json5
"footer": {
	"researchInfo": "assets/researchInfo/researchInfo.html"
},
```
The footer will be displayed ingame [/game](/index) or on the welcome screen [/welcome](/welcome) and contain clickable links to external information, like your research info or privacy protection.

The keys (e.g. `researchInfo`, `imprint`, `privacyProtection`) must be present in the [languageDict](Translating.md), as the actual text that will be displayed is taken from there. 

The values can be relative or absolute urls.

If you don't want any footer links, you can simply leave the brackets empty.


### groupIndex
```json5
"groupIndex": { // Required
	"enabled": true,
	"footer": "© {author} | {year}",
	"showDebug": true,
},
```


#### footer (groupIndex)
```json5
"footer": "© {author} | {year}" // Required
```
The footer displayed on the group index page.
You can not use HTML tags, since the value is html escaped, but some predefined variables are available to make the footer more powerful. These are replaced with the described value before the page is delivered to the player.

| Variable   | Explanation for replacement |
| ---------- | --------------------------- |
| `{author}` | Replaced with the value from [author](#author)                            |
| `{year}`   | The current year (server time) |

<!-- /app/router/routerStatic.py@groupIndex() -->

## Gamerules
<!--  Default values can be found inside:
	- `app/config.py`
	- `static/src/typings/globals.d.ts`
-->

Gamerules allow you to customize the difficulty, disclaimer etc. of multiple groups at once, but you can also create a gamerule per group.

### enableLogging
```json5
"enableLogging": true
```
True if a log file shall be created for players in a group with this gamerule. 

### showHelp
```json5
"showHelp": true
```
Not implemented right now. This feature is planned to enable explanations for the gate types 
while ingame.

### insertTutorials
```json5
"insertTutorials": true
```
Automatically insert Covert/Camouflage Gate Intro slides before the first level containing one of these gate types. If both gates are present, the covert intro is shown before the camouflage intro. You can also disable this feature to insert them manually in the level list to show them at a different time, or to hide them completely.

### scoreValues
```json5
"scoreValues": {
	"startValue": 100,
	"minimumScore": 0,
	"switchClick": -0,
	"simulate": -10,
	"wrongSolution": -10,
	"correctSolution": 0,
	"penaltyMultiplier": 1
}
```
The score is used to incentivize the player to use as few clicks as possible. When setting `scoreValues` you need to provide values for all keys (except for `penaltyMultiplier` which will default to 1).

| Value                 | Explanation                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `"startValue"`        | The initial score value to which the other values are added/subtracted                       |
| `"minimumScore"`      | The score will never go below this value. Set to a high negative number, if you need negative scores |
| `"switchClick"`       | Will be added every time a player clicks a switch                                            |
| `"simulate"`          | Will be added every time the player clicks the simulate button to start simulating (ending a simulation does not count) |
| `"wrongSolution"`     | If `"penaltyMultiplier"` = 0, this value will be added whenever the player clicks confirm while the level is not solved. See the equation below to learn how the value is calculated, that will be added to the score if `"penaltyMultiplier"` ≠ 0,                |
| `"correctSolution"`   | Will be added when the player clicks confirm and the solution is correct (all light bulbs on and all danger signs of) |
| `"penaltyMultiplier"` | Set this value to 1 if you want to increase the value added on every wrong confirm click. See the following equation & table to learn for further information |

The calculation of the value that is added to the score whenever the player confirms an unsolved level is a bit more involved, to allow for higher punishments of multiple wrong confirm click uses. The result of the following equation will be added the score:
$$\text{wrongSolution} \cdot \left(1 + \text{penaltyMultiplier} \cdot (\text{wrongConfirmClicks} - 1)\right)$$

As an example, the following table calculates the resulting scores if `"penaltyMultiplier"` is 0 or 1.

| wrongConfirmClicks | Addition                  | Player Score | Addition                  | Player Score |
| ------------------ | ------------------------- | ------------ | ------------------------- | ------------ |
|                    | `"penaltyMultiplier"` = 0 |              | `"penaltyMultiplier"` = 1 |              |
| 0                  |                           | 100          |                           | 100          |
| 1                  | -10                       | 90           | -10                       | 90           |
| 2                  | -10                       | 80           | -20                       | 70           |
| 3                  | -10                       | 70           | -30                       | 40           |
| 4                  | -10                       | 60           | -40                       | 0            |
| 5                  | -10                       | 50           | -50                       | 0            |

If the score is ≤ 0, the game shows a skip button if enabled in the config of the [Competition](#competitionshowskipbutton) or [Skill](#skillshowskipbutton) Phase.

### phaseDifficulty
```json5
"phaseDifficulty": {
	"Quali": "MEDIUM",
	"Competition": "MEDIUM",
	"Skill": "MEDIUM"
}
```
The difficulty can be modified for each phase and affects the visual feedback of current logic states.

| Difficulty | Explanation                                                                             |
| ---------- | --------------------------------------------------------------------------------------- |
| `"EASY"`     | The logic state of every wire and output is visible all the time                        |
| `"MEDIUM"`   | The logic state is visible only when clicking confirm or when using the simulate button |
| `"ADVANCED"` | Same as `"MEDIUM"` but the state is only shown on output gates not on wires & splitters |
| `"HARD"`     | The logic state is never shown                                                          |

### reminderTime
```json5
"reminderTime": 10
```
If a time limit is set for this phase, a "reminder" pop up will be shown before the timer ends. 
This variable controls the duration in seconds before the pop up is shown and the timer runs out.
You can't disable the "reminder" popup at the moment, but when you set this to zero the "time has run out" popup will be shown in front of the "reminder" popup.

### mediumShowSimulateButton
```json5
"mediumShowSimulateButton": false
```
Show the simulate button on `"MEDIUM"` or `"ADVANCED"` difficulty. 
The simulate button will allow you to see the current logic states of every wire and output gate, until you click the simulate button again. 
You cant modify the circuit while the power is shown and you will receive a [small penalty](#scorevalues) for using this feature.

### skillShowSkipButton
```json5
"skillShowSkipButton": "never"
```
Control the visibility of the skip level button during the Skill phase.

| Value          | Explanation                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| `"never"`      | Never show the skip button.                                                     |
| `"struggling"` | Show the skip button after the score reaches 0.                                 |
| `"always"`     | Show the skip level button at the start of each level for the entire duration.  |

### competitionShowSkipButton
```json5
"competitionShowSkipButton": "never"
```
Control the visibility of the skip level button during the Skill phase.

| Value          | Explanation                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| `"never"`      | Never show the skip button.                                                     |
| `"struggling"` | Show the skip button after the score reaches 0.                                 |
| `"always"`     | Show the skip level button at the start of each level for the entire duration.  |

### wrongSolutionCooldown
```json5
"wrongSolutionCooldown": 3
```
Time in seconds after the simulation can be disabled, when confirming a wrong solution (only relevant on MEDIUM [difficulty](#phasedifficulty)).

### wrongSolutionCooldown
```json5
"wrongSolutionCooldownLimit": 30
```
Maximum time in seconds to which the cooldown is clamped after applying the `wrongSolutionMultiplier`, when confirming a wrong solution (only relevant on MEDIUM [difficulty](#phasedifficulty)). Set to 0 to disable.

### wrongSolutionMultiplier
```json5
"wrongSolutionMultiplier": 2
```
Scaling factor for the `wrongSolutionCooldown` with the number of confirm clicks (only relevant on MEDIUM [difficulty](#phasedifficulty)). Set to 1 to disable.

### tutorialAllowSkip
```json5
"tutorialAllowSkip": "yes"
```
Control if and when a skip button shall be shown in the top right corner of `IntroduceElements`.

| Value       | Explanation                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `"yes"`     | Show the skip button if all slides have been unlocked (in a previous run).    |
| `"no"`      | Never show the skip button                                                    |
| `"always"`  | Always show the skip button, even if not all slides are unlocked.             |

### simulationAllowAnnotate
```json5
"simulationAllowAnnotate": false
```
Whether players will be able to use the drawing tools while the simulation of the current circuit state is shown (only relevant on MEDIUM [difficulty](#phasedifficulty))


### textPostSurveyNotice
```json5
"textPostSurveyNotice": "postSurvey"
```
A languageDict key that will be shown on the FinalScene. Some examples are given in the language library (`postSurvey`, `postSurveyFeedback`, `backToIndex` and `postSurveyDemo`).
See [Translating.md](./Translating.md) to find out how to modify the language library.

### pause
```json5
"pause": {
	"after": 120, // Required
	"duration": 30, // Required
	"startEvent": null, // Required
	"fileName": "pause.txt"
}
```

Force the player to take a break after the duration specified with `"after"`. This feature will not interrupt a currently running level. The player has to wait before the continue button can be clicked in order to proceed to the next level/phase. You can also manually add a pause in the [levelList.txt](./LevelList.md). Remove the `"pause"` entry from the config, if you don't need the functionality.

| Key            | Explanation                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `"after"`      | The time in seconds after the pause screen will be inserted (after `"startEvent"` was shown)    |
| `"duration"`   | The duration in seconds after which the pause slide can be skipped                              |
| `"startEvent"` | Start the timer after a phase with this name was shown. Set to `null` to use the first phase    |
| `"fileName"`   | A file placed under [${assetPath}/levels/special/pause](.) to show as the pause screen. |

> [!NOTE]\
> The pause screen is implemented as an info screen and therefore can only be shown in a phase with levels. Also keep in mind that the path to fileName [can be changed](GameConfig.md#assetpath).

### timeLimit
```json5
"timeLimit": {
	"after": 120, // Required
	"startEvent": null // Required
}
```
If the `"timeLimit"` section exists in the config, the time the player can play this game will be limited. The global timer will be activated after the first occurrence of `"startEvent"` and the game will end when a player switches levels/phases after the timer has run out. If `"startEvent"` is `null`, the timer will start at the beginning of the first phase.

| Key            | Explanation                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------- |
| `"after"`      | The time in seconds after the game will end (after `"startEvent"` was shown)                 |
| `"startEvent"` | Start the timer after a phase with this name was shown. Set to `null` to use the first phase |


### footer
```json5
"footer": {
	"impressum": "{impressum}",
	"research": "{research}",
	"privacy": "{privacy}"
}
```
Overrides values specified in the [game options](#game-options). If a value is set to an empty string (`""`), the link will disappear from the footer.

### allowRepetition
```json5
"allowRepetition": false
```
Allow the player to participate multiple times in this group

### urlPreSurvey
```json5
"urlPreSurvey": null
```
Redirect the player to this page, before the actual game starts. 
Can be used to let the player fill out a demographic survey etc. 

Set this to `null` to redirect the player directly to the game. 

You need to pass the pseudonym and can pass some additional information to your survey/website by using placeholders which get replaced by the server. \
Example: `"limesurvey/index.php/xyz?ui={ui}&lang={lang}"`

| Placeholder   | Explanation                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `{ui}` *      | The pseudonym that was generated by the game for the player/participant   |
| `{lang}` *     | The language that was selected by the player or auto detected by the game |
| `{group}`     | The group this player was assigned to                                     |
| `{timeStamp}` | The current server time in milliseconds                                   |

Your survey or website needs to store the pseudonym that was passed with the request params, because
afterwards you need to redirect the player back to the game. The url is [/game?ui={ui}&lang={lang}]() 
and you need to replace `{ui}` and should replace `{lang}` with the values you stored earlier. 
The other placeholders from the table above have no effect in the game link.

### urlPostSurvey
```json5
"urlPostSurvey": null
```
If this parameter is not `null`, a button will be displayed on the FinalScene which will redirect to the link specified in `urlPostSurvey`. You can use the following placeholders, which get replaced by the server, all of them are optional:

| Placeholder   | Explanation                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `{ui}`        | The pseudonym that was generated by the game for the player/participant   |
| `{lang}`      | The language that was selected by the player or auto detected by the game |
| `{group}`     | The group this player was assigned to                                     |
| `{timeStamp}` | The current server time in milliseconds                                   |

Example: `"limesurvey/index.php/xyz?ui={ui}&lang={lang}"`

### disclaimer
```json5
"disclaimer": "/assets/researchInfo/disclaimer_{lang}.html"
```
Show a popup/disclaimer that the player needs to accept before getting redirected to the [presurvey](#urlpresurvey) or the game itself. The site where the `disclaimer` link is pointing to will be displayed inside the popup. 

You can use the `{lang}` placeholder to supply different languages. The html file must contain a `<button>` that will be used as the continue/accept button.
One of the few exceptions not translated inside the [languageLibrary](./Translating.md).

| Placeholder   | Explanation                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `{lang}`      | The language that was selected by the player or auto detected by the game |

Set to `null` to disable/skip the disclaimer popup.


## Groups
> [!NOTE]\
>  Never start your group name with `debug`, because this prefix is used internally!

You can use **group**s to show different levels or even phases to different player pools. When the player reaches out to [/](/) or [/welcome](/welcome), the server will automatically assign the player to the group with the smallest number of participants. 
The number of participants per group is not stored between reboots, but you can set the participant counter to an arbitrary number, for e.g. you can set a high number to prevent a player getting automatically assigned to that group.

To manually assign a player to a group, give them a link that contains the `group` param like so: [/?group={YOUR_GROUP}](/?group=easy) or [/welcome?group={YOUR_GROUP}](/welcome?group=easy). 


The contents of a group might look like this:
```jsonc
"easy": {
	"ctr": 0,
	"config": "configStudy",
	"phases": ["IntroduceElements", "IntroduceDrawingTools", "Quali", "Competition", "FinalScene"],
	"Quali": {
		"shuffle": false,
		"levels": "levels_quali.txt"
	},
	"Competition": {
		"shuffle": true,
		"levels": "levels_study2_low.txt"
	}
}
```

### ctr
```json5
"ctr": 0 // Required
```
Every group has a counter how many player already participated in this group. It gets incremented after the player reaches the FinalScene/postSurvey. This variable influences the start value of this internal counter. Set this to a high value (e.g. 9000) to prevent a player getting automatically assigned to this group, or set it to a negative value if you wan't to fill this group first with participants. Leave it at zero otherwise.

### config
```json5
"config": "gameruleName" // Required
```
Select the gamerules for this group, must be one of the rules defined in [chapter gamerules](#gamerules).

### phases
```json5
"phases": ["IntroduceElements", "IntroduceDrawingTools", "Quali", "Competition", "FinalScene"] // Required
```
The player will go through these phases in the specified order. See [Overview.md](./Overview.md#phases--scenes) for an explanation of all phases. Some Phases need additional configuration, these are marked in the following list:

- IntroduceElements
- IntroduceDrawingTools
- [Quali](#quali--competition)
- [Competition](#quali--competition)
- [Skill](#skill)
- [Alternative](#alternative)
- FinalScene

### Quali / Competition
```json5
"Quali": {
	"levels": "levels_quali.txt", // Required
	"shuffle": false
}
```
```json5
"Competition": {
	"levels": ["levelList_One.txt", "levelList_Two.txt"], // Required
	"shuffle": false
}
```
Configure the levels and circuits shown in Quali or Competition phase, and optionally set a time limit. The options for Quali and Competition are the same.

| Key           | Explanation                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `"levels"`    | Either a string or a list of strings containing the relative path to a level list file. See [LevelList.md](./LevelList.md) for more details |
| `"shuffle"`   | `true` if the order of the contents of each individual level list shall be randomized, `false` otherwise. |
| `"timeLimit"` | Limit the time the player can take to complete this phase. The value is given in seconds, to configure a 10 minute time limit, set this value to `"timeLimit": 600`. <br> The player will receive a warning before the timer runs out. See [Chapter reminderTime](#remindertime) on how to configure it. |


### Skill
```json5
"Skill": {
	"levels": "levels_study2_low.txt", // Required
	"shuffle": false,
	"groups": {
		"pleb": 0,
		"guru": 40
	} // Required
}
```
After the Skill phase ends, the player will be assigned to one of the `groups` from the list, based on their performance.

| Key           | Explanation                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `"levels"`    | Either a string or a list of strings containing the relative path to a level list file. See [LevelList.md](./LevelList.md) for more details |
| `"shuffle"`   | `true` if the order of the contents of each individual level list shall be randomized, `false` otherwise. |
| `"timeLimit"` | Limit the time the player can take to complete this phase. The value is given in seconds, to configure a 10 minute time limit, set this value to `"timeLimit": 600`. <br> The player will receive a warning before the timer runs out. See [Chapter reminderTime](#remindertime) on how to configure it. |
| `"groups"` | An object containing `"{group}": {score}` pairs. The smallest score where the player score is >= the configured score will be chosen. |

### Alternative
```json5
"Alternative": {
	"levels": "", // Required
	"shuffle": false
}
```

The config options for the Alternative task are basically the same as in [Quali/Competition](#quali--competition) with the exception, that there are two new level file types: `iframe` and `url`. These allow you to show custom html based tasks, that will either be included in an HTML `<iframe>` tag or will be loaded by jQuery inside a `<div>`. See [AltTask.md](./AltTask.md) for further details on how to design an alternative task.

If no time limit is set for this phase, a skip level button will be shown in the bottom right corner. This will be hidden if a time limit is set.

If the alternative task shall only show one level/slide, you may configure this directly without using the [level list](./LevelList.md) aka. `"levels":`.

```json5
"Alternative": {
	"url": "", // Required
	"iframe": false
}
```

The following table lists all possible config options:

| Key           | Explanation                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `"levels"`    | Either a string or a list of strings containing the relative path to a level list file. See [LevelList.md](./LevelList.md) for more details |
| `"shuffle"`   | `true` if the order of the contents of each individual level list shall be randomized, `false` otherwise. |
| `"timeLimit"` | Limit the time the player can take to complete this phase. The value is given in seconds, to configure a 10 minute time limit, set this value to `"timeLimit": 600`. <br> The player will receive a warning before the timer runs out. See [Chapter reminderTime](#remindertime) on how to configure it. |
| `"url"` | (Mutually exclusive with `"levels"`) The url to a task that shall be shown on the slide. If you wanna show more than one task, use `"levels"`. |
| `"iframe"` | (Mutually exclusive with `"levels"`) True if the task shall be shown in an `<iframe>`, otherwise it will be loaded in a `<div>` |


### hide
```json5
"hide": false
```
Hide this group from the [/index](/index) group index page. The group is not disabled, players with a link can still play it.
