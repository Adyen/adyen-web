import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import StateField from './StateField';
import getDataset from '../../../../core/Services/get-dataset';
import Specifications from '../Specifications';
import { mock } from 'jest-mock-extended';
import { StateFieldProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import Language from '../../../../language';
import type { ILanguageService } from '../../../../language/LanguageService';

jest.mock('../../../../core/Services/get-dataset');
const statesMock = [
    {
        id: 'CA',
        name: 'California'
    },
    {
        id: 'NY',
        name: 'New York'
    }
];

const LOADING_CONTEXT = 'test';

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(statesMock)));
const mockedProps = mock<StateFieldProps>();

const { i18n, resources } = setupCoreMock().modules;

const renderStateField = (props = {}, languageService = i18n) => {
    return render(
        <CoreProvider i18n={languageService} loadingContext={LOADING_CONTEXT} resources={resources}>
            <StateField specifications={new Specifications()} {...props} {...mockedProps} />
        </CoreProvider>
    );
};

beforeEach(() => {
    (getDataset as jest.Mock).mockClear();
});

describe('StateField', () => {
    test('does not call getDataset when no country is passed', () => {
        renderStateField();
        expect(getDataset).not.toHaveBeenCalled();
    });

    test('does not call getDataset when a country with no states dataset is passed', () => {
        renderStateField({ selectedCountry: 'AR' });
        expect(getDataset).not.toHaveBeenCalled();
    });

    test('calls getDataset when a country with states dataset is passed', () => {
        renderStateField({ selectedCountry: 'US' });
        expect(getDataset).toHaveBeenCalled();
    });

    test('loads states', async () => {
        renderStateField({ selectedCountry: 'US' });
        await waitFor(() => {
            expect(screen.getAllByRole('option')).toHaveLength(2);
        });
    });

    test('preselects the passed state', async () => {
        const value = 'CA';
        renderStateField({ selectedCountry: 'US', value });
        await waitFor(() => {
            expect(screen.getByRole('combobox')).toHaveValue('California');
        });
    });

    test('should not load the dropdown if no states were loaded', () => {
        renderStateField({ selectedCountry: 'AR' });
        expect(screen.queryByRole('combobox')).toBeNull();
    });

    test('fetches the dataset using the translations locale, not the locale requested by the merchant', () => {
        // 'es-MX' is not a locale we ship translations for, so it resolves to 'es-ES'
        const language = new Language({ locale: 'es-MX', service: mock<ILanguageService>({}) });
        expect(language.locale).toBe('es-MX');
        expect(language.translationsLocale).toBe('es-ES');

        renderStateField({ selectedCountry: 'US' }, language);

        expect(getDataset).toHaveBeenCalledWith('states/US', LOADING_CONTEXT, 'es-ES');
    });

    test('fetches the dataset using the translations locale when the merchant locale needs no fallback', () => {
        const language = new Language({ locale: 'nl-NL', service: mock<ILanguageService>({}) });

        renderStateField({ selectedCountry: 'US' }, language);

        expect(getDataset).toHaveBeenCalledWith('states/US', LOADING_CONTEXT, 'nl-NL');
    });
});
