---
pagetitle: 'Documentation: Translating'
lang: en

created: 2023-08-04
---

# Translating the HRE Game
The localization for this game is controlled by the languageDict. The languageDict is a file that contains every text that is presented to the end user in every language that shall be supported by the game. 
Out of the box the game supports German (DE) and English (EN).

## Location
You can find the source file for the languageDict in the games source code:

[${assetPath}/languageLibrary/languageLibrary](/examples/conf/assets/languageLibrary/languageLibrary)

## Translating
- ${assetPath}/languageLibrary/languageLibrary
- templates/welcome.html@languageDict
- 

GameUtils.js:5
```javascript
const supportedLanguages = ['DE', 'EN'];
```