import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import PersonalDetails from './PersonalDetails';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { PersonalDetailsProps } from './types';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const renderPersonalDetails = (props: Partial<PersonalDetailsProps>) => {
    const { setComponentRef = jest.fn() } = props;

    const core = setupCoreMock();

    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <PersonalDetails {...props} setComponentRef={setComponentRef} />
        </CoreProvider>
    );
};

describe('PersonalDetails', () => {
    test('should show only the required fields', () => {
        const requiredFields = ['firstName', 'lastName', 'telephoneNumber'];
        renderPersonalDetails({ requiredFields });

        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/telephone number/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    });

    test('should show plain text if "readonly" is set', () => {
        const requiredFields = ['firstName', 'lastName'];
        const data = { firstName: 'John', lastName: 'Smith' };

        renderPersonalDetails({ requiredFields, data, visibility: 'readOnly' });

        expect(screen.getByText('John', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('Smith', { exact: false })).toBeInTheDocument();

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('should prefill the data in editable mode', () => {
        const data = {
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: '1990-01-01',
            telephoneNumber: '0610001122',
            shopperEmail: 'shopper@email.com'
        };

        renderPersonalDetails({ data });

        expect(screen.getByLabelText(/first name/i)).toHaveValue(data.firstName);
        expect(screen.getByLabelText(/last name/i)).toHaveValue(data.lastName);
        expect(screen.getByLabelText(/telephone number/i)).toHaveValue(data.telephoneNumber);
        expect(screen.getByLabelText(/email address/i)).toHaveValue(data.shopperEmail);
        expect(screen.getByLabelText(/date of birth/i)).toHaveValue(data.dateOfBirth);
    });

    test('should return the data in the expected format on initial render', async () => {
        const data = {
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: '1990-01-01',
            telephoneNumber: '0610001122',
            shopperEmail: 'shopper@email.com'
        };

        const onChange = jest.fn();
        renderPersonalDetails({ data, onChange });

        // The onChange event is likely fired in a `useEffect`, so we wait for the mock to be called.
        await waitFor(() => {
            expect(onChange).toHaveBeenCalled();
        });

        const { data: formattedData } = onChange.mock.calls[0][0];

        // Assert that the data is correctly transformed (e.g., firstName/lastName moved into shopperName)
        expect(formattedData.shopperName.firstName).toBe(data.firstName);
        expect(formattedData.shopperName.lastName).toBe(data.lastName);
        expect(formattedData.dateOfBirth).toBe(data.dateOfBirth);
        expect(formattedData.telephoneNumber).toBe(data.telephoneNumber);
        expect(formattedData.shopperEmail).toBe(data.shopperEmail);

        // Assert that the original top-level keys are no longer present
        expect(formattedData.firstName).toBeUndefined();
        expect(formattedData.lastName).toBeUndefined();
    });
});
