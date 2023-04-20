import { mock } from 'jest-mock-extended';
import Language from '../../src/language';
import englishTranslations from '../../src/language/locales/en-US.json';
import { Resources } from '../../src/core/Context/Resources';
import getImageUrl from '../../src/utils/get-image';
import getImage from '../../src/utils/get-image';

function setupi18nMock() {
    const i18n = mock<Language>();
    i18n.loaded = Promise.resolve();
    i18n.get.mockImplementation(key => englishTranslations[key]);
    return i18n;
}

function setupResourceMock() {
    const resources = mock<Resources>();
    resources.getImage.mockImplementation(() => getImage({}));
    return resources;
}

global.i18n = setupi18nMock();
global.resources = setupResourceMock();
