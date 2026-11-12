import type { DataSetItem } from '../../../../core/Services/data-set';
import type { PhoneInputSchema } from '../../../internal/PhoneInput/types';
import type { ClickToPaySignupDetails, ClickToPaySignupFormData, ClickToPaySignupPaymentData } from './types';

const removeWhitespace = (value: string): string => value.replace(/\s/g, '');
const removeNonDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * Splits an E.164 telephone number into the longest matching prefix and the remaining digits.
 * Without a matching prefix, every digit goes into the phone number.
 */
export function splitTelephoneNumber(telephoneNumber: string | undefined, phonePrefixes: string[]): PhoneInputSchema {
    if (!telephoneNumber) return {};

    const normalizedNumber = removeWhitespace(telephoneNumber);
    const matchingPrefix = phonePrefixes
        .filter(prefix => prefix && normalizedNumber.startsWith(removeWhitespace(prefix)))
        .sort((a, b) => removeWhitespace(b).length - removeWhitespace(a).length)[0];

    if (!matchingPrefix) {
        return { phoneNumber: removeNonDigits(normalizedNumber) };
    }

    return {
        phonePrefix: matchingPrefix,
        phoneNumber: removeNonDigits(normalizedNumber.slice(removeWhitespace(matchingPrefix).length))
    };
}

/**
 * The phone prefix items only carry their country in the name, formatted by usePhonePrefixes as '+31 (NL)'.
 */
export function getPhonePrefixForCountry(phonePrefixes: DataSetItem[], countryCode: string | undefined): string | undefined {
    if (!countryCode) return undefined;

    const countrySuffix = `(${countryCode.toUpperCase()})`;
    return phonePrefixes.find(({ name }) => name.endsWith(countrySuffix))?.id;
}

export function getSignupDetails({ firstName, lastName, shopperEmail, phonePrefix, phoneNumber }: ClickToPaySignupFormData): ClickToPaySignupDetails {
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const trimmedEmail = shopperEmail?.trim();
    const telephoneNumber = phoneNumber ? `${phonePrefix ? removeWhitespace(phonePrefix) : ''}${phoneNumber}` : undefined;

    return {
        ...(trimmedFirstName && { firstName: trimmedFirstName }),
        ...(trimmedLastName && { lastName: trimmedLastName }),
        ...(trimmedEmail && { shopperEmail: trimmedEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
}

/**
 * Maps the sign-up details to the top-level payment data fields, leaving out the missing ones
 */
export function formatClickToPaySignupData({
    firstName,
    lastName,
    shopperEmail,
    telephoneNumber
}: ClickToPaySignupDetails): ClickToPaySignupPaymentData {
    return {
        ...((firstName || lastName) && {
            shopperName: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName })
            }
        }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
}
