import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

console.log(useTranslation);

void i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        // the translations
        // (tip move them in a JSON file and import them,
        // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
        resources: {
            en: {
                translation: {
                    'Welcome to React': 'Welcome to React and react-i18next'
                }
            }
        },
        fallbackLng: 'en',
        debug: true,

        interpolation: {
            escapeValue: false // not needed for react!!
        },

        react: {
            defaultTransParent: 'div' // needed for preact
        }
    });

export default i18n;
