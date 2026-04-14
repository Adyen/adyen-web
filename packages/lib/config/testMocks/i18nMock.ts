import Language from '../../src/language';
import enUS from '../../../server/translations/en-US.json';
import { ILanguageService } from '../../src/language/LanguageService';
import { mock } from 'jest-mock-extended';

function setupi18n() {
    const mockedService = mock<ILanguageService>({});
    const i18n = new Language({ locale: 'en-US', service: mockedService });
    i18n['_translations'] = enUS;

    return i18n;
}

global.i18n = setupi18n();
