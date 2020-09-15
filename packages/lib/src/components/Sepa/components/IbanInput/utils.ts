import countries from './specifications';

/**
 * Parse the BBAN structure used to configure each IBAN __specification and returns a matching regular expression.
 * A structure is composed of blocks of 3 characters (one letter and 2 digits). Each block represents
 * a logical group in the typical representation of the BBAN. For each group, the letter indicates which characters
 * are allowed in this group and the following 2-digits number tells the length of the group.
 *
 * @param structure - the structure to parse
 * @param countryCode - the countryCode to check format against
 *
 * @internal
 */
export const parseStructure = (structure, countryCode) => {
    if (countryCode === null || !countries[countryCode] || !countries[countryCode].structure) {
        return false;
    }

    const passedStructure = countries[countryCode].structure;

    // split in blocks of 3 chars
    const regex = passedStructure.match(/(.{3})/g).map(block => {
        // parse each structure block (1-char + 2-digits)
        const pattern = block.slice(0, 1);
        const repeats = parseInt(block.slice(1), 10);
        let format;

        switch (pattern) {
            case 'A':
                format = '0-9A-Za-z';
                break;
            case 'B':
                format = '0-9A-Z';
                break;
            case 'C':
                format = 'A-Za-z';
                break;
            case 'F':
                format = '0-9';
                break;
            case 'L':
                format = 'a-z';
                break;
            case 'U':
                format = 'A-Z';
                break;
            case 'W':
                format = '0-9a-z';
                break;
            default:
                break;
        }

        return `([${format}]{${repeats}})`;
    });

    return new RegExp(`^${regex.join('')}$`);
};

/**
 * @internal
 */
export const formatIban = iban =>
    iban
        .replace(/\W/gi, '')
        .replace(/(.{4})(?!$)/g, '$1 ')
        .trim();

/**
 * Returns any non alphanumeric characters and uppercases them
 *
 * @internal
 */
export const electronicFormat = iban => {
    const NON_ALPHANUM = /[^a-zA-Z0-9]/g;
    return iban.replace(NON_ALPHANUM, '').toUpperCase();
};

/**
 * Lazy-loaded regex (parse the structure and construct the regular expression the first time we need it for validation)
 *
 * @internal
 */
export const regex = (iban, countryCode) => parseStructure(iban, countryCode);

/**
 * Prepare an IBAN for mod 97 computation by moving the first 4 chars to the end and transforming the letters to
 * numbers (A = 10, B = 11, ..., Z = 35), as specified in ISO13616.
 * @param ibanInput - The IBAN value
 * @returns The prepared IBAN
 *
 * @internal
 */
export const iso13616Prepare = ibanInput => {
    let iban = ibanInput;
    const A = 'A'.charCodeAt(0);
    const Z = 'Z'.charCodeAt(0);
    iban = iban.toUpperCase();
    iban = iban.substr(4) + iban.substr(0, 4);

    return iban
        .split('')
        .map(n => {
            const code = n.charCodeAt(0);

            if (code >= A && code <= Z) {
                // A = 10, B = 11, ... Z = 35
                const codeA = code - A;
                return codeA + 10;
            }

            return n;
        })
        .join('');
};

/**
 * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
 *
 * @param iban -
 *
 * @internal
 */
export const iso7064Mod97_10 = iban => {
    let remainder = iban;
    let block;

    while (remainder.length > 2) {
        block = remainder.slice(0, 9);
        remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
    }

    return parseInt(remainder, 10) % 97;
};

/**
 *  @param countryCode -
 *  @returns Example of IBAN Number
 */
export const getIbanPlaceHolder = (countryCode = null) => {
    if (countryCode && countries[countryCode] && countries[countryCode].example) {
        return formatIban(countries[countryCode].example);
    }

    return 'AB00 1234 5678 9012 3456 7890';
};

export const getIbanCountrySpecification = countryCode => {
    if (countryCode && countries[countryCode]) {
        return countries[countryCode];
    }

    return false;
};

/**
 *  @param cursor -
 *  @param iban -
 *  @param previousIban -
 *  @returns new cursor position
 */
export const getNextCursorPosition = (cursor, iban, previousIban) => {
    if (cursor === 0 || !iban.length) return 0;

    // This tells us how long the edit is. If user modified input from `(2__)` to `(243__)`,
    // we know the user in this instance pasted two characters
    const editLength = iban.length - previousIban.length;
    const isAddition = editLength > 0;
    const isMaskChar = (ibanValue, position) => /\s/.test(ibanValue.charAt(position));
    const initialCursor = cursor - editLength;

    // is adding text, check calculate if there was a mask element after the initial cursor, then move cursor forward
    // example: NL13 ABNA| 1234 5678 9 => NL13 ABNA 0|123 4567 89
    if (isAddition && (isMaskChar(iban, initialCursor + 1) || isMaskChar(iban, initialCursor))) {
        return cursor + 1;
    }

    // is removing text, check if the previous is a mask character, then move cursor back
    // example: NL13 ABNA 0|123 4567 89 => NL13 ABNA| 1234 5678 9
    if (!isAddition && isMaskChar(iban, cursor - 1)) {
        return cursor - 1;
    }

    return cursor;
};
