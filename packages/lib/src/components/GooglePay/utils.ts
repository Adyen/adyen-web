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

// export function mapBrands(brands) {
//     const brandMapping = {
//         mc: 'MASTERCARD',
//         amex: 'AMEX',
//         visa: 'VISA',
//         interac: 'INTERAC',
//         discover: 'DISCOVER'
//     };
//     return brands.reduce((accumulator, item) => {
//         if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
//             accumulator.push(brandMapping[item]);
//         }
//         return accumulator;
//     }, []);
// }

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
