const path = require('path');

const LOCALES = [
    'da-DK',
    'de-DE',
    'en-US',
    'es-ES',
    'fi-FI',
    'fr-FR',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'nl-NL',
    'no-NO',
    'pl-PL',
    'pt-BR',
    'ru-RU',
    'sv-SE',
    'zh-CN',
    'zh-TW'
];

const localesReducer = (acc, locale) => {
    acc[locale] = path.join(__dirname, `../src/language/locales/${locale}.js`);
    return acc;
};

module.exports = [
    {
        mode: 'production',
        bail: true,
        devtool: false,
        entry: {
            ...LOCALES.reduce(localesReducer, {}),
            all: path.join(__dirname, `../src/language/locales/index.ts`)
        },
        output: {
            filename: path => `locales/${path.chunk.name}.js`,
            path: path.join(__dirname, '../dist'),
            library: ['AdyenCheckoutLocales', '[name]'],
            libraryTarget: 'umd',
            libraryExport: 'default'
        }
    }
];
