import { h } from 'preact';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import CompanyDetails from './CompanyDetails';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { CompanyDetailsProps } from './types';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const renderCompanyDetails = (props: CompanyDetailsProps = {}) => {
    const core = setupCoreMock();

    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <CompanyDetails {...props} />
        </CoreProvider>
    );
};

describe('CompanyDetails', () => {
    test('should render both fields when no props are provided', () => {
        renderCompanyDetails();

        expect(screen.getByLabelText(/company name/i)).toHaveValue('');
        expect(screen.getByLabelText(/registration number/i)).toHaveValue('');
    });

    test('should show only the required fields', () => {
        renderCompanyDetails({ requiredFields: ['name'] });

        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/registration number/i)).not.toBeInTheDocument();
    });

    test('should prefill the data in editable mode', () => {
        renderCompanyDetails({ data: { name: 'Adyen', registrationNumber: '34259528' } });

        expect(screen.getByLabelText(/company name/i)).toHaveValue('Adyen');
        expect(screen.getByLabelText(/registration number/i)).toHaveValue('34259528');
    });

    test('should show plain text if visibility is "readOnly"', () => {
        renderCompanyDetails({ data: { name: 'Adyen', registrationNumber: '34259528' }, visibility: 'readOnly' });

        expect(screen.getByText('Adyen', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('34259528', { exact: false })).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('should render nothing if visibility is "hidden"', () => {
        renderCompanyDetails({ visibility: 'hidden' });

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('should call onChange with the formatted data', async () => {
        const onChange = jest.fn();
        renderCompanyDetails({ data: { name: 'Adyen', registrationNumber: '34259528' }, onChange });

        await waitFor(() => {
            expect(onChange).toHaveBeenCalled();
        });

        const { data } = onChange.mock.calls[0][0];
        expect(data).toStrictEqual({ company: { name: 'Adyen', registrationNumber: '34259528' } });
    });

    test('should update the data when the shopper types', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderCompanyDetails({ onChange });

        await user.type(screen.getByLabelText(/company name/i), 'Adyen');

        await waitFor(() => {
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ data: { company: { name: 'Adyen' } } }));
        });
    });

    test('should prefix the input names and still update the data when a namePrefix is provided', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderCompanyDetails({ namePrefix: 'billing', onChange });

        const nameInput = screen.getByLabelText(/company name/i);
        expect(nameInput).toHaveAttribute('name', 'billing.name');

        await user.type(nameInput, 'Adyen');

        await waitFor(() => {
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ data: { company: { name: 'Adyen' } } }));
        });
    });

    test('should mark the field as valid on blur when a name was entered', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderCompanyDetails({ requiredFields: ['name'], onChange });

        const nameInput = screen.getByLabelText(/company name/i);
        await user.type(nameInput, 'Adyen');
        await user.tab();

        await waitFor(() => {
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ valid: { name: true }, isValid: true }));
        });
        expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('should ignore events coming from an input without a name', () => {
        const onChange = jest.fn();
        renderCompanyDetails({ onChange });

        const callCountAfterRender = onChange.mock.calls.length;
        const nameInput = screen.getByLabelText<HTMLInputElement>(/company name/i);
        nameInput.name = '';

        fireEvent.input(nameInput, { target: { value: 'Adyen' } });
        nameInput.focus();
        nameInput.blur();

        expect(onChange).toHaveBeenCalledTimes(callCountAfterRender);
    });

    test('should expose showValidation through the component ref', async () => {
        const setComponentRef = jest.fn();
        renderCompanyDetails({ setComponentRef });

        expect(setComponentRef).toHaveBeenCalledTimes(1);
        const ref = setComponentRef.mock.calls[0][0];

        ref.showValidation();

        await waitFor(() => {
            expect(screen.getByLabelText(/company name/i)).toHaveAttribute('aria-invalid', 'true');
        });
    });
});
