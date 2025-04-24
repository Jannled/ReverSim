---
pagetitle: 'Documentation: Level List'
lang: en

created: 2023-08-04 14:26
---

# The levelList.txt files
The level list files control, what levels, info slides etc. are shown in the phases with levels. 
You can reuse levelLists for multiple phases if desired. Choose a file name as you like and reference it in the [gameConfig.json](./GameConfig.md) (the .txt file extension is not mandatory). 
Place your levelList files inside the folder [${assetPath}/levels](.) of your game files.

When the `"shuffle"` option is enabled, all files with type level are randomized. The order of all other file types stays the same. See [chapter Example](#example) for further explanation.

## Slides with levels
You can configure levels/infos/etc. for the following phases:
- [Quali](./GameConfig.md#quali--competition)
- [Competition](./GameConfig.md#quali--competition)
- [Skill](./GameConfig.md#skill)
- [AltTask](./GameConfig.md#alternative)


## Example
An example levelList might look like this:
```yml
text: competitionPhase_Expert.txt
level: expert/Low_Level5
level: expert/Medium_Level6
level: expert/High_Level6
level: expert/Camouflage_Level2
text: onlyOneLevelRemaining.txt
level: expert/Covert_Level1
```

When the `"shuffle"` option is [turned on](GameConfig.md#quali--competition), competitionPhase_Expert.txt will always be shown first and onlyOneLevelRemaining.txt as 6th slide, but the levels are all thrown in a pool and drawn in a randomized order, e.g. expert/Low_Level5 could become the last level.

## Level Types
| Level Type     | Description |
| -------------- | ------------------------------------------------------------------------- |
| `text`       | Info slides can be used to show a screen filling text to the player, a continue button in the bottom right corner will take the player to the next slide.                    |
| `level`      | Use the [LevelEditor](./LevelEditor.md) to create levels.                   |
| `url`        | Only valid inside an `AltTask`-scene                                        |
| `iframe`     | Only valid inside an `AltTask`-scene                                        |
| `tutorial`   | `camouflage`, `covert`                                                      |
| `special`    | Info/text slides with [special functionality](#special-slides)              |

These are only the level/slide types, which can be configured inside the level list. For a full list of level types, see [Overview.md](./Overview.md#levels-info-screens-etc).

## File Paths
The paths you specify inside the levelList txt depend on the file type and are relative to the following folders:

| Level Type | Path |
| ---------- | ---- |
| `level` | [${assetPath}/levels/differentComplexityLevels/](.) |
| `info` | [${assetPath}/levels/infoPanel/](.) |
| `tutorial` | [${assetPath}/levels/elementIntroduction/](.) |
| `special` | [${assetPath}/levels/special/](.) |

## Special Slides
Special slides are a "special" kind of info slides with additional functionality. The slides must be placed in their respective subfolder in order to work properly as by the following table:

| Special Type       | Subfolder | Description                                               | 
| ------------------ | --------  | --------------------------------------------------------- |
| Voluntary Tutorial | [${assetPath}/levels/special/retut](.) | Show two buttons, a continue button and one button that allows the player to repeat the element intro & quali levels |
| Pause              | [${assetPath}/levels/special/pause](.) | Force the user to take a break, show a screen with a countdown which can only be skipped after a duration specified in [gameConfig.json](./GameConfig.md#pause). |

You can customize the text shown on the slides and show different slides for different groups.
The pause slide can be automatically inserted after a configured time, the path of the inserted slide is configured inside [gameConfig.json](./GameConfig.md#pause).

These examples show, how to manually add each special to the level list:
```yml
special: retut/voluntaryTutorial.txt
special: pause/pause.txt`
```
