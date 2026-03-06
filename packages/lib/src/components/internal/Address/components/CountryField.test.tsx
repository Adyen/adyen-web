import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import CountryField from './CountryField';
import getDataset from '../../../../core/Services/get-dataset';
import { mock } from 'jest-mock-extended';
import { CountryFieldProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

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

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(countriesMock)));
const countryFieldPropsMock = mock<CountryFieldProps>();

const renderCountryField = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <CountryField {...props} {...countryFieldPropsMock} />
        </CoreProvider>
    );
};

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
});
