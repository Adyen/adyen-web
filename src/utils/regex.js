/**
 * @private
 * @constant {email}
 * @type {RegExp}
 */
export const email = /^\s*[\w\-+_]+(\.[\w\-+_]+)*@[\w\-+_]+\.[\w\-+_]+(\.[\w-+_]+)*\s*$/;

/**
 * @private
 * @constant {phone}
 * @type {RegExp}
 */
export const telephoneNumber = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s./0-9]*$/;
