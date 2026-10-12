import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import CountryField from './CountryField';
import getDataset from '../../../../core/Services/get-dataset';
import { mock } from 'jest-mock-extended';
import { CountryFieldProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import Language from '../../../../language';
import type { ILanguageService } from '../../../../language/LanguageService';

jest.mock('../../../../core/Services/get-dataset');
const countriesMock = [
    {
        id: 'NL',
        name: 'Netherlands'
    },
    {
        id: 'SG',
        name: 'Singapore'
    },
    {
        id: 'US',
        name: 'United States'
    }
];

const LOADING_CONTEXT = 'test';

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(countriesMock)));
const countryFieldPropsMock = mock<CountryFieldProps>();

const { i18n, resources } = setupCoreMock().modules;

const renderCountryField = (props = {}, languageService = i18n) => {
    return render(
        <CoreProvider i18n={languageService} loadingContext={LOADING_CONTEXT} resources={resources}>
            <CountryField {...props} {...countryFieldPropsMock} />
        </CoreProvider>
    );
};

beforeEach(() => {
    (getDataset as jest.Mock).mockClear();
});

describe('CountryField', () => {
    test('calls getDataset', () => {
        renderCountryField();
        expect(getDataset).toHaveBeenCalled();
    });

    test('loads countries', async () => {
        renderCountryField();
        await waitFor(() => {
            expect(screen.getAllByRole('option')).toHaveLength(countriesMock.length);
        });
    });

    test('only loads the allowed countries ', async () => {
        const allowedCountries = ['US', 'NL'];
        renderCountryField({ allowedCountries });
        await waitFor(() => {
            expect(screen.getAllByRole('option')).toHaveLength(allowedCountries.length);
        });
    });

    test('preselects the passed country', async () => {
        const value = 'NL';
        renderCountryField({ value });
        await waitFor(() => {
            expect(screen.getByRole('combobox')).toHaveValue('Netherlands');
        });
    });

    test('should be read only if there is only one item', async () => {
        const allowedCountries = ['NL'];
        const value = 'NL';
        renderCountryField({ value, allowedCountries });
        await waitFor(() => {
            const combobox = screen.getByRole('combobox');
            expect(combobox.getAttribute('readonly')).not.toBeNull();
        });
    });

    test('fetches the dataset using the translations locale, not the locale requested by the merchant', () => {
        // 'es-MX' is not a locale we ship translations for, so it resolves to 'es-ES'
        const language = new Language({ locale: 'es-MX', service: mock<ILanguageService>({}) });
        expect(language.locale).toBe('es-MX');
        expect(language.translationsLocale).toBe('es-ES');

        renderCountryField({}, language);

        expect(getDataset).toHaveBeenCalledWith('countries', LOADING_CONTEXT, 'es-ES');
    });

    test('fetches the dataset using the translations locale when the merchant locale needs no fallback', () => {
        const language = new Language({ locale: 'nl-NL', service: mock<ILanguageService>({}) });

        renderCountryField({}, language);

        expect(getDataset).toHaveBeenCalledWith('countries', LOADING_CONTEXT, 'nl-NL');
    });
});
