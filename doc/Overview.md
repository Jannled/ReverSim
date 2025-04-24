---
pagetitle: 'Documentation: Overview'
lang: en

created: 2023-08-09
---

# Overview about the HRE game
This documentation shall describe the core aspects of the game

## Phases / Scenes
The name phase and scene are used interchangeably throughout the documentation, but mean the same thing. The word phase was first used in internal communication, but the word scene has also established since every phase is implemented as a `Scene` in Phaser3. 

| Name | I. |  Description |
|------|----|-------------|
| PreloadScene | ✗ | Never really shown to the player, the very fist scene the game runs which will load all resources and request the current scene from the server. |
| BaseScene | ✗ | This Scene extends from the Phaser3 Scene class and serves as the Base class for all other scenes |
| GameScene | ✗ | This Scene will show tasks to the player and allows for a countdown to be configured. Base Scene for Quali, Competition and Alternative |
| LevelEditor | ~ | The [level editor](./LevelEditor.md). Should only be used with the [provided config](./LevelEditor.md#configuration). |
| LevelViewer | ~ | The level viewer, mainly used by the [screenshot tool](). Should only be used with the [provided config](./LevelEditor.md#configuration) and not in normal gameplay. |
| GameIntro | ✓ | First scene shown to the player. Will show a play button and the language switcher. I strongly recommend to use the new [/welcome](/welcome) endpoint instead of this scene, to prevent automatic crawlers from creating logfiles |
| IntroduceElements | ✓ | Introduce all logic gates and circuit parts to the player |
| IntroduceDrawingTools | ✓ | Ask the player to familiarize themselves with the drawing tools |
| Quali | ✓ | The player need to pass these levels, in order to proceed to the next phase. If there are too many mistakes, the player will be thrown back to `IntroduceElements` |
| Competition | ✓ | The main game phase where the player will play the study relevant levels |
| SkillScene | ✓ | Switch to a different group which depends on how well the player performed during this phase |
| Alternative | ✓ | Present some html based task or info to the player |
| FinalScene | ✓ | Thank the player for participating and redirect to post survey if configured |

A checkmark (✓) in the column "I." denotes, that this class can be used in [gameConfig.json](./GameConfig.md). Otherwise it is only for internal purposes.

## Levels, Info screens, etc.
The names in the logfile will differ from the internal representation used by the Back- and Frontend. This table will help to translate between the different representations:

| [Logfile](./Logfile.md) | Internal | [LevelList](./LevelList.md) | Description |
|---|---|---|---|
| Info | info | text | A slide containing text only |
| Level | level | level | A slide containing a circuit to solve |
| AltTask | url | url | A slide with an alternative task, written in HTML/Javascript |
| AltTask | iframe | iframe | A slide with an alternative task, embedded in an iframe tag |
| Tutorial | tutorial | tutorial | Intro Camouflage and Intro Covert, automatically shown if configured inside `gameConfig.json` |
| LocalLevel | localLevel | | Used by the level editor, to bypass the request to the server for a level |
| Special | special | special | An info screen with additional functionality. (e.g. voluntary tutorial, break) |
