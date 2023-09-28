import Language from '../../src/language';

function setupi18n() {
    const i18n = new Language('en-US');
    return i18n;
}

global.i18n = setupi18n();
