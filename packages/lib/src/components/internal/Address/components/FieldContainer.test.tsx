import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import FieldContainer from './FieldContainer';
import Specifications from '../Specifications';
import getDataset from '../../../../core/Services/get-dataset';
import { mock } from 'jest-mock-extended';
import { FieldContainerProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

jest.mock('../../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(
    jest.fn(() =>
        Promise.resolve([
            { id: 'AL', name: 'Alabama' },
            { id: 'AK', name: 'Alaska' }
        ])
    )
);

const propsMock = {
    errors: {},
    data: {},
    valid: {},
    specifications: new Specifications()
};

const mockedProps = mock<FieldContainerProps>();
const renderFieldContainer = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <FieldContainer {...propsMock} {...props} {...mockedProps} />
        </CoreProvider>
    );
};

describe('FieldContainer', () => {
    test('renders the StateField', async () => {
        renderFieldContainer({ fieldName: 'stateOrProvince', data: { country: 'US' } });

        await waitFor(() => {
            expect(getDataset).toHaveBeenCalled();
        });

        expect(screen.getByText(/State/i)).toBeTruthy();
    });

    test('renders the CountryField', async () => {
        renderFieldContainer({ fieldName: 'country' });

        await waitFor(() => {
            expect(getDataset).toHaveBeenCalled();
        });

        expect(screen.getByText(/Country/i)).toBeTruthy();
    });

    test('renders text fields for the other fields', () => {
        renderFieldContainer({ fieldName: 'street' });
        expect(screen.getByRole('textbox')).toBeTruthy();
    });
});
