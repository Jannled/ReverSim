/**
 * Get and Set cookies. Seriously why are these not part of the standard library?
 * 
 * Source: https://www.w3schools.com/js/js_cookies.asp
 */
class CookieUtils
{
	/**
	 * Set a cookie.
	 * @param {string} cName The name of the cookie.
	 * @param {string} cValue The value to store inside the cookie.
	 * @param {number} exDays Number of days after which the cookie will expire. Defaults to 30 days.
	 * @param {string} path Defaults to '/'
	 * @returns 
	 */
	static setCookie(cName, cValue, exDays = 30, path='/')
	{
		const d = new Date();
		d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
		let expires = "expires=" + d.toUTCString();
		return document.cookie = cName + "=" + cValue + ";" + expires + ";SameSite=Strict;path=" + path;
	}

	/**
	 * Get a cookie by name.
	 * @param {string} cname The name of the cookie.
	 * @returns The raw value stored inside the specified cookie.
	 */
	static getCookie(cname)
	{
		let name = cname + "=";
		let ca = document.cookie.split(';');
		for(let i = 0; i < ca.length; i++)
		{
			let c = ca[i].trim();
			
			// Check if string starts with name
			if(c.indexOf(name) == 0)
				return c.substring(name.length, c.length);
		}
		return "";
	}
}