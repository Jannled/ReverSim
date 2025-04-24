---
pagetitle: 'Documentation: HRE Logfile Format'
lang: en
keywords: 
    - MPI-SP
    - Logfile
description: |
    Documentation for the Logfile format
---

# Documentation Logfile
For every participant of this study, a logfile is created under `/statistics/LogFiles/logFile_{pseudonym}.txt`. They sequentially log all interactions and visual updates on the frontend, be it a switch click, a pop up, drawing or a new level request. 
Additionally a screenshot will be created whenever the participant uses the the drawing tool. The images are stored under `/statistics/canvasPics/{pseudonym}/{phase}/{?level}/{i}.png`

We also provide a tool to convert the log from this time series based format to a CSV file where you can select different metrics. See the [Log Parser documentation](./LogParser.md) for additional details.

## General structure
The client communicates with the server via the JsonRPC api. The server will then transform the received events into the following format:

- The events are separated by a blank line (an empty line in between aka two line breaks).
- A single event is a list of key-value pairs, the key value pairs are separated by a single line break.
- All keys (except for `Time`) start with a paragraph symbol (`§`), the values are separated by a colon followed by a spacebar (`: `).
- An event will at least contain the `Time` and the `§Event`-Type. Depending on the type of the event additional key-value pairs will follow with additional data.

Below is a general example to understand the format, throughout the documentation we will provide you with examples for every single event.

```
Time: {Unix Time}
§Event: {EventName}
§{Key}: {Value}
{...}
```

The `{Unix Time}` value is a UNIX timestamp in milliseconds (the logfile parser will also understand the `HH:MM:SS AM/PM` format for legacy reasons, but newer logfiles should only contain UNIX timestamps).

In current logfiles most of the timestamps are client time, meaning the browser of the participant will send the timestamp at which the event occurred. However there are some exceptions:

| Event                                       | Description                                                     |
| ------------------------------------------- | --------------------------------------------------------------- |
| [Created Logfile](#event-created-logfile)   | server time                                                     |
| [SkillAssessment](#event-skillassessment)   | server time                                                     |
| [Redirect](#event-redirect)                 | server time                                                     |
| [Group Assignment](#event-group-assignment) | server time on first assignment, client time in SkillAssessment |
| [Game Over](#event-game-over)               | server time                                                     |
| [AltTask](#alternative-task)                | Depends on [your implementation](./AltTask.md)                  |


The game is divided into [Phases/Scenes](#phase-related-events), with some Phases additionally containing [Levels](#levels-infos-tasks--tutorials). The events themselves don't contain information about the current Scene/Level etc. they belong to, therefore they are very sensitive to their ordering! Every event that comes after e.g. a level change is assumed to belong to that level. The server will go a long way to ensure the events are written in the correct order (all time stamps should be ascending).


## Global Events
The events in [this section](#global-events) don't belong to any Scene/Phase or Slide/Level. 

### Event: Created Logfile
The very first event in the logfile. Will contain the server `§Version` and the short git hash of the local clone of the git repository (`§GitHashS` might be blank e.g. in the Docker container). Additionally the `§Pseudonym` of the player is stored, in case the file gets renamed.
```
Time: 1691682280836
§Event: Created Logfile
§Version: 1.7.0
§Pseudonym: 4159ce0385a420655513222706991fa7
§GitHashS: 24c5684
```

### Event: Group Assignment
Usually the second event in the log. `§Group` denotes to which group the player was assigned, the group can either be selected manually or the player is auto assigned to the group with the smallest finish count. \
Groups starting with  `debug` will skip the Presurvey if one is configured.

This event might occur again if a [Skill Phase](#event-skillassessment) is [configured](./GameConfig.md).

```
Time: 1686586233116
§Event: Group Assignment
§Group: debuglow
```

### Event: Redirect
The player can be redirected to a different website for a survey etc.
Two redirects can be [configured](./GameConfig.md#urlpresurvey) an will produce an entry in the log once the player 
- preSurvey: Usually the third event in the log and shown to the player immediately after the player clicks the play button. If no preSurvey is configured, the `§Redirect` field contains the relative url to the game.
- postSurvey: If enabled a button in the FinalScene will redirect the player to the `§Redirect` url once clicked.

```
Time: 1691682280836
§Event: Redirect
§Destination: /game?group=debugLow&onsite=1&lang=de&ui=4159ce0385a420655513222706991fa7
```


### Event: TimeSync
The server stores a difference between the client time and the server time at which the event was received. If this difference deviates too much in a JsonRPC call, this event is logged. This can be due to ping problems or the client reconfiguring their time during the game (evil). 
This event should appear at least once when the client and server communicate for the first time. \
The client time at which the event was send is logged in `§Time` and the server time at which the event was received is stored in `§Server`.

```
Time: 1691682499383
§Event: TimeSync
§Server: 1691682499389
```

### Event: Online after disconnection 
This message indicates that the client and server where unable to communicate for the number of seconds specified in `§Duration`, but the communication could now be established again. Some of the possible reasons are, that the player has left the page for the preSurvey, but this can also indicate network issues.

```
Time: 1691682500191
§Event: Online after disconnection 
§Duration[s]: 219.359
```

### Event: Game over
Logged when the group counter is incremented after the the player finished the game.
```
Time: 13:52:30
§Event: Game Over
```


## Phase related Events
As mentioned in the introduction, the player will progress through different phases (sometimes also referred to as scenes). The following subsections deal with the events that mark the beginning of these phases.

| Phase / Scene         | Description                                                                            | Drawing  | Slides  |
| --------------------- | -------------------------------------------------------------------------------------- | -------- | ------- |
| PreloadScene          | Logged whenever the player is reloading the page, but never shown to the user          | -        | -       |
| GameIntro             | Got replaced by the [/welcome](/welcome) page, but can still be used                   | no       | no      |
| IntroduceElements     | Introduce all logic gates and circuit parts to the player                              | no       | no      |
| IntroduceDrawingTools | Ask the player to draw something                                                       | yes      | no      |
| Quali                 | Check if the player has understood the element introduction before moving on           | yes      | yes     |
| Competition           | The main game phase where the player will play the study relevant levels               | yes      | yes     |
| SkillScene            | Evaluate the performance of the player and assign them to a different group afterwards | yes      | yes     |
| Alternative           | Present some html based task or info to the player                                     | yes      | yes     |
| FinalScene            | Thank the player for participating and redirect to post survey if configured           | no       | no      |

### Event: change in Scene
```
Time: 1691682499383
§Event: change in Scene
§Scene: IntroduceElements
```

There is a special kind of scene, which is logged whenever the website is loaded.
The screen is black while the game loads the necessary resources. \
When starting the game for the first time, this event will be immediately followed by the [change in Scene](#event-change-in-scene) and [loaded Scene](#event-loaded-phase) events, with one of the scenes from the table above.
If the player is reloading the page, the [change in Scene](#event-change-in-scene) event is missing. If a slide is active, the [new Slide](#event-new-levelinfoetc) event will also be missing, but the [loaded Slide](#event-loaded) event is logged.
```
Time: 1691682499383
§Event: change in Scene 
§Scene: PreloadScene
```

### Event: Loaded Phase
```
Time: 1691682499412
§Event: Loaded Phase 
§Phase: IntroduceElements
```

### Event: SkillAssessment
```
Time: 1659073427000
§Event: SkillAssessment
§Score: 40
```

## Levels, Infos, Tasks & Tutorials
The Quali, Competition, SkillAssessment and AltTask Phase are further divided into slides. These will be shown one after another. After the last slide was shown and solved (if applicable), the player will continue to the next phase. During the transition of slides or phases the screen will fade to black.

The following table shows you the four slide types which are differentiated in the logfile:

| Slide type | Description                                             |
| ---------- | ------------------------------------------------------- |
| Info       | Just a blank slide with some text and a continue button |
| Level      | A circuit is shown which needs to be solved             |
| AltTask    | A html based task is shown to the user                  |
| Tutorial   | The Camouflage / Covert gate is introduced              |

See [Overview.md](./Overview.md#levels-info-screens-etc) if you need further details.

The events are roughly in the following order:
1. [new Info/Level](#event-new-levelinfoetc) is logged as soon as the client requests the next slide. The screen should be black right now.
2. If a [PopUp](#popups) is shown at the beginning of the Level it is created now while the screen is dark
3. [Loaded Info/Level](#event-loaded) is logged after the level was downloaded and the screen has faded to the new level. This is the time at which the player sees the slide/level and can start playing it.
4. If the slide type is not Info, several events from [this section](#levels-infos-tasks--tutorials), [PopUps](#popups) and [Drawing Tools](#drawing-tools) will follow while the player is solving the task.
5. The slide will end with a [click on the next button](#event-click-next).

### Event: new Level/Info/etc.
Called when the level is requested from the server. The screen remains black while the client is preparing the slide \
Possible values for `§Event` are `new {slide type}`, with `{slide type}` being one of the values from the [table above](#levels-infos-tasks--tutorials). \
`§Filename` will be the slide path relative to 
```
Time: 1655136313760
§Event: new Level
§Filename: alow_00000001
```

### Event: Loaded
Called when the level is shown client side. This might be delayed because of a popup. <br>
Values for `§Type` are either `Level`, `Info` or `Tutorial`.
```
Time: 1655136313903
§Event: Loaded
§Type: Level
```

### Event: Switch Click
When occurring inside Element/Drawing Tools Introduction or inside an info screen:
```
Time: 15:12:22
§Event: Click
§Object: Switch
§Solving State: 1
```

When occurring inside GameScene / Actual Game \
If a certain type of logic element is missing, it will not print an empty list but instead disappear from the log
(And yes Inverter is misspelled)
```
Time: 18:36:04
§Event: Click
§Object: Switch
§Switch ID: 4, Level Solved: 1
§Switch_States [ID, click state, outputstate]: [3, false, 0][4, true, 1][5, 0, 0]
§Bulb_States [ID, output state]: [6, 1]
§DangerSign_States [ID, output state]: [8, 0]
§Inverter_States [ID, output state]: [9, true]
§And-Gate_States [ID, output state]: [10, 1]
§Or-Gate_States [ID, output state]: [7, 0]
```

### Event: Confirm Click
```
Time: 18:36:05
§Event: Click
§Object: ConfirmButton
§Level Solved: 1
§Switch_States [ID, click state, outputstate]: [3, false, 0][4, true, 1][5, 0, 0]
§Bulb_States [ID, output state]: [6, 1]
§Inverter_States [ID, output state]: [9, true]
§And-Gate_States [ID, output state]: [10, 1]
§Or-Gate_States [ID, output state]: [7, 0]
```

### Event: Simulate
```
```

### Event: Click Next
Load the next level/scene. Logged when the user presses next after the Drawing/Element Introduction, Final Scene, Camouflage Intro and since v1.6.3 also after each level.
```
Time: 
§Event: Click
§Object: Continue Button
```


### Event: Pass / Fail Quali
In the Quali phase, an additional event will be logged after the level was solved successfully (after the confirm click and before the level solved popup).
```
Time: 11:12:13
§Event: Passing First Quali Level
```

But if the player fails the qualification, meaning he has too many switches or confirm clicks, this message will be logged instead and the player is send back to element introduction.
```
Time: 11:12:13
§Event: Failing Second Quali Level
```

## PopUps
### Event: PopUp Displayed
```
Time: 15:14:23
§Event: Pop-Up displayed
§Content: Explaining Confirm Button
```

```
Time: 11:12:13
§Event: Pop-Up displayed
§Content: Introducing Skip-Level Button
```

Level solved popup:
```
Time: 15:15:41
§Event: Pop-Up displayed
§Content: Feedback about Clicks
§Nmbr Switch Clicks: 2
§Optimum Switch Clicks: 2
§Nmbr Confirm Clicks: 1
```

```
Time: 11:12:13 PM
§Event: Pop-Up displayed
§Content: Invitation to paint
```

```
Time: 11:12:13
§Event: Pop-Up displayed
§Content: Seconds remaining
§Seconds remaining: 30
```

```
Time: 11:12:13 AM
§Event: Pop-Up displayed
§Content: Timer End
§Seconds remaining: 0
```

## Drawing Tools
Every time the player releases the pen or interacts with the drawing toolbar on the left side, one of the following events will be created. Additionally, a screenshot is stored every time the player lifts the pen or uses the delete button.

See the table in the [Phase section](#phase-related-events) to know when the drawing tools can be used.

### Event: Click Brush
The value for `§Color` can be `Red`, `Green` and `Blue`
```
Time: 
§Event: Click
§Object: Brush
§Color: Red
```

### Event: Click Eraser/Delete Button
The value for `§Object` can either be `Eraser` or `Delete Button`
```
Time: 15:13:54
§Event: Click
§Object: Eraser
```

### Event: Used Pen
```
Time: 15:13:54
§Event: Used Pen 
§Color: 16777215
```

### Event: Used drawing tool
The value for `§Tool` can either be `eraser` or `delete button`
```
Time: 15:13:54
§Event: Used drawing tool
§Tool: delete button
```

## Alternative Task


## Examples
Quali Pass event order
```
Time: 1652651537703
§Event: Pop-Up displayed
§Content: Feedback about Clicks
§Nmbr Switch Clicks: 3
§Optimum Switch Clicks: 3
§Nmbr Confirm Clicks: 1

Time: 1652651537704
§Event: Passing first Quali Level

Time: 1652651538216
§Event: Click
§Object: Pop-Up Button
§Consequence Event: Pop-Up closed

Time: 1652651538655
§Event: Click
§Object: Hook
§Switch_States [ID, click state, outputstate]: [3, true, 1][4, true, 1][5, true, 1]
§Bulb_States [ID, output state]: [6, 1]
§And-Gate_States [ID, output state]: [7, 1][8, 1]
```

Quali Fail event order
```
Time: 1652651523905
§Event: Pop-Up displayed
§Content: Feedback about Clicks
§Nmbr Switch Clicks: 4
§Optimum Switch Clicks: 1
§Nmbr Confirm Clicks: 1

Time: 1652651523906
§Event: Failing second Quali Level

Time: 1652651524689
§Event: Click
§Object: Hook
§Switch_States [ID, click state, outputstate]: [3, 0, 0][4, 0, 0][5, false, 0]
§Bulb_States [ID, output state]: [6, 0]
§Inverter_States [ID, output state]: [9, true]
§And-Gate_States [ID, output state]: [10, 0]
§Or-Gate_States [ID, output state]: [7, 0]

Time: 1652651524689
§Event: change in Scene
§Scene: IntroduceElements
```