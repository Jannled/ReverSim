---
created: 2024-04-08 00:52
---

# Level Folder
If you are looking for the folder, where you will need to place your level files, level list, info panels etc.: Congratulations you are in the right place.
The game expects to find the different file types in the following folders:

| Path                         | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `./`                         | LevelList files.                                            |
| `differentComplexityLevels/` | Normal levels.                                              |
| `infoPanel/`                 | Slides that contain only text but no circuit.               |
| `special/pause/` [^1]        | InfoPanel with a countdown, which will force the player to take a break. The path will be relative to the `special/` folder, so in gameConfig.json you have to specify `pause/levelName.txt`. |
| `special/retut/` [^1]        | Ask the player, if he want's to repeat the tutorial. The path will be relative to the `special/` folder, so in the levelList.txt you have to specify `retut/levelName.txt`. |
| `elementIntroduction/`       | You will not need to touch anything in here, unless you are reworking the ElementIntro Phase. |
| `introDrawings/`             | The drawing (arrow and text) shown in the IntroduceDrawingTools Phase. |

You can use subfolders for organization, the path that you will need to fill in the config file/level list will be relative to the respective folder from the table above, with one exception [^1].

[^1]: The path of the special slides are relative to the `special/` folder, because the client will distinguish the special slides by their path. If the `pause/` or `retut/` prefix are missing, the slides will not work as intended!

> [!NOTE]\
> You **can't** use `../` to break out of the parent directory.

## Further reading
- [[LevelEditor]] | [doc/LevelEditor.md](/doc/LevelEditor.md)
- [[LevelList]] | [doc/Level.md](/doc/LevelList.md)
- [[GameConfig]] | [doc/GameConfig.md](/doc/GameConfig.md)
