/**
 * Email regex follows https://en.wikipedia.org/wiki/Email_address.
 * It checks that the email address starts with a local part that includes letters, digits, and some special characters, optionally separated by periods.
 * Alternatively, the local part can be enclosed in quotes and include any characters except a new line.
 * This is followed by an `@` symbol and a domain name or an IP address enclosed in square brackets.
 * The domain name consists of one or more words separated by periods, where each word can include letters, digits, and hyphens. The top-level domain must consist of two or more letters.
 */
export const email =
    // eslint-disable-next-line max-len
    /^(([a-z0-9!#$%&'*+\-/=?^_`{|}~]+(\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*)|(".+"))@((\[((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}])|((([a-z]+-*)*[a-z]+\.)+[a-z]{2,}))$/i;

/**
 * Telephone number regex
 */
export const telephoneNumber = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s./0-9]*$/;
