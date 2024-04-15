import { httpGet } from './http';
import getTranslations from './get-translations';

jest.mock('./http');
const mockedHttpGet = httpGet as jest.Mock;

const LOADING_CONTEXT = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
const ADYEN_WEB_VERSION = '6.0.0';

beforeEach(() => {
    mockedHttpGet.mockReset();
});

describe('Service: getTranslations', () => {
    test('should request translations if we support the given locale', async () => {
        const mockedEnUS = {
            storeDetails: 'Save for my next payment'
        };
        mockedHttpGet.mockResolvedValue(mockedEnUS);

        const translation = await getTranslations(LOADING_CONTEXT, ADYEN_WEB_VERSION, 'en-US', 'remote');

        expect(mockedHttpGet).toHaveBeenCalledTimes(1);
        expect(mockedHttpGet).toHaveBeenCalledWith({
            errorLevel: 'fatal',
            errorMessage: 'Translations: Couldn\'t fetch translation for the locale "en-US".',
            loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
            path: 'sdk/6.0.0/translations/en-US.json'
        });
        expect(translation).toStrictEqual(mockedEnUS);
    });

    test('should request translations if we support the given locale, even though there are custom translations for it', async () => {
        const mockedEnUS = {
            storeDetails: 'Save for my next payment'
        };
        mockedHttpGet.mockResolvedValue(mockedEnUS);

        const customTranslation = {
            'en-US': {
                storeDetails: 'Store the details for next payments'
            }
        };

        const translation = await getTranslations(LOADING_CONTEXT, ADYEN_WEB_VERSION, 'en-US', 'local', customTranslation);

        expect(mockedHttpGet).toHaveBeenCalledTimes(1);
        expect(mockedHttpGet).toHaveBeenCalledWith({
            errorLevel: 'fatal',
            errorMessage: 'Translations: Couldn\'t fetch translation for the locale "en-US".',
            loadingContext: '/',
            path: 'sdk/6.0.0/translations/en-US.json'
        });
        expect(translation).toStrictEqual(mockedEnUS);
    });

    test('should not request translation if an unsupported locale with translations is provided', async () => {
        const customTranslation = {
            'en-CA': {
                pay: 'Pay amount'
            }
        };

        const translation = await getTranslations(LOADING_CONTEXT, ADYEN_WEB_VERSION, 'en-CA', 'local', customTranslation);

        expect(translation).toStrictEqual({});
        expect(mockedHttpGet).toHaveBeenCalledTimes(0);
    });

    test('should throw an error and not make http request if locale is not supported', () => {
        expect(() => getTranslations(LOADING_CONTEXT, ADYEN_WEB_VERSION, 'en-CA', 'local')).toThrowError(
            "Translations: Locale 'en-CA' is not supported"
        );
    });
});
