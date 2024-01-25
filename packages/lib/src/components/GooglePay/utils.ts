import { AddressData } from '../../types/global-types';

/**
 *
 */
export function resolveEnvironment(env = 'TEST'): google.payments.api.Environment {
    const environment = env.toLowerCase();
    switch (environment) {
        case 'production':
        case 'live':
        case 'live-au':
        case 'live-apse':
        case 'live-us':
        case 'live-in':
            return 'PRODUCTION';
        default:
            return 'TEST';
    }
}

/**
 * This function formats Google Pay contact format to Adyen address format
 *
 * Setting 'houseNumberOrName' to ZZ won't affect the AVS check, and it will make the algorithm take the
 * house number from the 'street' property.
 */
export function formatGooglePayContactToAdyenAddressFormat(
    paymentContact?: Partial<google.payments.api.Address>,
    isDeliveryAddress?: boolean
): AddressData | undefined {
    if (!paymentContact) {
        return;
    }

    return {
        postalCode: paymentContact.postalCode,
        country: paymentContact.countryCode,
        street: [paymentContact.address1, paymentContact.address2, paymentContact.address3].join(' ').trim(),
        houseNumberOrName: 'ZZ',
        city: paymentContact.locality || '',
        ...(paymentContact.administrativeArea && { stateOrProvince: paymentContact.administrativeArea }),
        ...(isDeliveryAddress && {
            firstName: paymentContact.name
        })
    };
}

const supportedLocales = [
    'en',
    'ar',
    'bg',
    'ca',
    'cs',
    'da',
    'de',
    'el',
    'es',
    'et',
    'fi',
    'fr',
    'hr',
    'id',
    'it',
    'ja',
    'ko',
    'ms',
    'nl',
    'no',
    'pl',
    'pt',
    'ru',
    'sk',
    'sl',
    'sr',
    'sv',
    'th',
    'tr',
    'uk',
    'zh'
];

export function getGooglePayLocale(locale = '') {
    const twoLetterLocale = locale.toLowerCase().substring(0, 2);
    return supportedLocales.includes(twoLetterLocale) ? twoLetterLocale : null;
}
