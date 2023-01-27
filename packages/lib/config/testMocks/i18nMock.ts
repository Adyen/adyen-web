import { mock } from 'jest-mock-extended';
import Language from '../../src/language';
import englishTranslations from '../../src/language/locales/en-US.json';

function setupi18nMock() {
    const i18n = mock<Language>();
    i18n.loaded = Promise.resolve();
    i18n.get.mockImplementation(key => englishTranslations[key]);
    return i18n;
}

global.i18n = setupi18nMock();
