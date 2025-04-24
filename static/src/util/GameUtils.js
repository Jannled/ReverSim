/** CONFIG */
const enforceCookie = gamerules.enableLogging;
const userCookieName = 'pseudonym'
const userGroupName = 'group'
const supportedLanguages = ['DE', 'EN'];

/**
 * Get the user language either from the searchParams or from the browser preferences.
 * @returns {string} The language code (two uppercase letters).
 */
function getGameLanguage()
{
	let params = new URLSearchParams(document.location.search);
	let language = params.get("lang");

	// Check if the language is defined in the searchParams and supported by the game
	// otherwise ask the browser for the language code
	if((typeof language != "string" || !supportedLanguages.includes(language)) && typeof lang == "string")
		language = lang; 
	// last resort: set language to english
	else
		language = "EN";
	
	return language.toLocaleUpperCase();
}

function getDisclaimerLoc(gLang = LangDict.gameLanguage)
{
	if(typeof gamerules.disclaimer == "string")
		return gamerules.disclaimer.replace('{lang}', gLang.toLowerCase());

	return null;
}

/**
 * Try to prevent the user to enter multiple times. This will not block players from reconnecting, but if they start a new game
 * and a specified cookie is set, block them to continue.
 * 
 * Under the following scenarios, the cookie check will be disabled:
 *  - You passed `onsite="1"` as an http get parameter
 *  - Logging is disabled in the gamerules
 * @returns True if the player is allowed to start the game, false Otherwise
 */
function allowLaunch()
{
	// Cookie check is disabled in a cookie or in a http get param
	if(CookieUtils.getCookie('debug').length > 1)
		return true;

	// Allow to play the game multiple times if enabled in the config
	if(gamerules.allowRepetition == true)
		return true;

	// Check if a cookie was set in a previous game session
	if(enforceCookie && CookieUtils.getCookie(userCookieName).length > 10)
		return false;

	// No cookie is set, go ahead
	return true;
}

/**
 * 
 * https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
 * 
 * @returns true if we believe that the device is manuaftured by Apple, false if not.
 */
function isApple()
{
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes(navigator.platform)
		// iPad on iOS 13 detection
		|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**
 * Wrapper for the raw `languageDict` variable. Use this class to localize the game
 */
class LangDict 
{
	constructor() { throw "This is an abstract class, you should not create an instance"; }

	/**
	 * Get the translated text for the specified key
	 * @param {string} key The key of the translation entry in the languageDict
	 * @param {string} p_gameLang (Optional) The language.
	 */
	static get(key, p_gameLang=LangDict.gameLanguage)
	{
		try // Try to get the requested key from the languageDict
		{
			const val = LangDict.languageDict[key][p_gameLang];
			if(val == null) throw "Translation value not found"
			return val;
		}
		catch(err1)
		{
			try // Try to fall back to english, but definitely print an error
			{
				console.error(`Missing language key "${key}" in language "${p_gameLang}" (${err1})`);
				
				const val = LangDict.languageDict[key]["EN"];
				if(val == null) throw "Translation value not found"
				return LangDict.languageDict[key]["EN"];
			}
			catch(e) // All else failed, just print the key and pray that the user understands it
			{
				return "{" + key + "}";
			}
		}
	}

	static load(fileStr)
	{
		let labels = [];
		fileStr = fileStr.trim();
		fileStr = fileStr.split('§Label:');

		if(fileStr[0] == '') fileStr.shift();

		for(let labelEntry of fileStr)
		{
			labelEntry = labelEntry.split('§');
			const label = labelEntry[0].trim();
			LangDict.languageDict[label] = [];
			labels.push(label);

			// pop first entry (= label) out of array
			labelEntry.shift();

			for(let typeEntry of labelEntry)
			{
				const i = typeEntry.indexOf(':');
				let typeName = typeEntry.slice(0, i);
				let content = typeEntry.slice(i + 1);

				typeName = $.trim(typeName);
				content = $.trim(content);
				LangDict.languageDict[label][typeName] = content;
			}
		}

		return labels;
	}

	/**
	 * Load a raw `languageDict` object
	 * @param {*} languageDict 
	 */
	static loadObject(languageDict)
	{
		Object.assign(LangDict.languageDict, languageDict);
	}

	static changeLang(newLang)
	{
		// Make sure that the language is defined and supported
		if(typeof newLang != "string" || !supportedLanguages.includes(newLang))
		{
			console.error('The language "' + newLang + '" is not supported');
			LangDict.gameLanguage = 'EN';
		}

		LangDict.gameLanguage = newLang;
	}

	/**
	 * Return the ordinal number for a given integer.
	 * @param {number} n The cardinal number.
	 * @returns {string} The according ordinal number like first, second, third etc..
	 */
	static getOrdinalNumber(n)
	{
		const numberWords = ['0th', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];

		if(typeof n === "string" && !isNaN(n) && !isNaN(parseInt(n)))
			return numberWords[parseInt(n)];
		else if(typeof n === 'number' && n < numberWords.length)
			return numberWords[n];
		else
			return n + 'th';
	}

	/**
	 * Return the number word for this digit
	 * @param {number} n The cardinal number.
	 * @returns {string} The according word for numbers from 0 to 12, after this, only the number will be returned.
	 */
	static getCardinalNumber(n)
	{
		const numberWords = {
			'DE': ['Null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'],
			'EN': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
		}

		const lang = LangDict.gameLanguage in numberWords ? LangDict.gameLanguage : 'EN';

		if(typeof n === "string" && !isNaN(n) && !isNaN(parseInt(n)))
			return numberWords[lang][parseInt(n)];
		else if(typeof n === 'number' && n < numberWords[lang].length)
			return numberWords[lang][n];
		else
			return n + '';
	}
}

// create a dictionary for language library
LangDict.languageDict = {
	"unloaded": {
		"EN": "The language library was not loaded."
	}
};

// set default language
LangDict.gameLanguage = getGameLanguage();
