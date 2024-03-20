import Language from '../../src/language';
import enUS from '../../../server/translations/en-US.json';

function setupi18n() {
    const i18n = new Language({ locale: 'en-US', translations: enUS });
    return i18n;
}

global.i18n = setupi18n();
