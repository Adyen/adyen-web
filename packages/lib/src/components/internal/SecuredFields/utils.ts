import { Resources } from '../../../core/Context/Resources';
import { camelCaseToSnakeCase } from '../../../utils/textUtils';
import { isArray } from './lib/utilities/commonUtils';
import { ALL_SECURED_FIELDS, ENCRYPTED } from './lib/constants';

/**
 * Used by SecuredFieldsProviderHandlers
 */
export const getCardImageUrl = (brand, resources: Resources) => {
    const type = brand === 'card' ? 'nocard' : brand || 'nocard';

    const imageOptions = {
        type,
        extension: 'svg'
    };

    return resources.getImage(imageOptions)(type);
};

/**
 * Used by Card.tsx & SecuredFields.tsx
 * @param fieldType -
 */
export const fieldTypeToSnakeCase = (fieldType: string) => {
    let str = camelCaseToSnakeCase(fieldType);
    // SFs need their fieldType mapped to what the endpoint expects
    if (ALL_SECURED_FIELDS.includes(fieldType)) {
        str = str.substring(ENCRYPTED.length + 1); // strip 'encrypted_' off the string
    }
    return str;
};

// REGULAR "UTIL" UTILS

/**
 * 'Destructures' properties from object - returns a new object only containing those properties that were asked for (including if those properties
 * have values that are falsy: null, undefined, false, '').
 *
 * @param args - property names to select: can be either 'regular' arguments (comma separated list) or an array
 * @returns - an object with a function 'from' that accepts a single argument - the object from which to choose properties.
 * This function returns a new object - a copy of the original but only including the desired properties
 *
 * @example const strippedObj = pick('cardType', 'securityCode').from(cardObject);
 * @example const strippedObj = pick(['cardType', 'securityCode']).from(cardObject);
 */
export function pick(...args) {
    const myArgs = isArray(args[0]) ? args[0] : args;
    return {
        from: obj => {
            // eslint-disable-line
            return myArgs
                .map(k => (k in obj ? { [k]: obj[k] } : {})) // eslint-disable-line
                .reduce((res, o) => ({ ...res, ...o }), {});
        }
    };
}

/**
 *'Destructures' properties from object, returning a new object containing all the original objects properties except those that were specifically rejected
 *
 * @param args - property names to reject: can be either 'regular' arguments (comma separated list) or an array
 * @returns - an object with a function 'from' that accepts a single argument - the object from which to reject properties.
 * This function returns a new object - a copy of the original but excluding the selected properties
 *
 * @example const strippedObj = reject('permittedLengths', 'pattern', 'startingRules').from(cardObject);
 * @example const strippedObj = reject(['permittedLengths', 'pattern', 'startingRules']).from(cardObject);
 */
export function reject(...args) {
    const myArgs = isArray(args[0]) ? args[0] : args;
    return {
        from: obj => {
            const vkeys = Object.keys(obj).filter(k => !myArgs.includes(k));
            return pick(...vkeys).from(obj);
        }
    };
}
