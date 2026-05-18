import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import StateField from './StateField';
import getDataset from '../../../../core/Services/get-dataset';
import Specifications from '../Specifications';
import { mock } from 'jest-mock-extended';
import { StateFieldProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

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

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(statesMock)));
const mockedProps = mock<StateFieldProps>();
const renderStateField = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <StateField specifications={new Specifications()} {...props} {...mockedProps} />
        </CoreProvider>
    );
};

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
});
