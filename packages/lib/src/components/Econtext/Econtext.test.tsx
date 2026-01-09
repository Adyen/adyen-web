import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Econtext from './Econtext';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const getVoucherDetailValue = async (label: string) => {
    const labelElement = await screen.findByText(label);
    // eslint-disable-next-line testing-library/no-node-access
    return labelElement.nextElementSibling as HTMLElement;
};

const expectVoucherDetailValue = async (label: string, expectedValue: string) => {
    const valueElement = await getVoucherDetailValue(label);
    expect(valueElement).toHaveTextContent(expectedValue);
};

describe('Econtext', () => {
    const core = setupCoreMock();

    const onSubmitMock = jest.fn();

    const props = {
        i18n: core.modules.i18n,
        loadingContext: 'test',
        onSubmit: onSubmitMock,
        modules: { resources: core.modules.resources }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendered fields', () => {
        test('should render personal details form fields by default', async () => {
            const econtext = new Econtext(core, props);
            render(econtext.render());

            expect(await screen.findByLabelText('First name')).toBeInTheDocument();
            expect(await screen.findByLabelText('Last name')).toBeInTheDocument();
            expect(await screen.findByLabelText('Telephone number')).toBeInTheDocument();
            expect(await screen.findByLabelText('Email address')).toBeInTheDocument();
        });

        test('should render FormInstruction by default', async () => {
            const econtext = new Econtext(core, props);
            render(econtext.render());

            expect(await screen.findByText('All fields are required unless marked otherwise.')).toBeInTheDocument();
        });

        test('should not render personal details form if personalDetailsRequired is false', () => {
            const econtext = new Econtext(core, { ...props, personalDetailsRequired: false });
            render(econtext.render());

            expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Last name')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Telephone number')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
        });
    });

    describe('Validation on submit without completing form', () => {
        test('should show validation errors when submitting empty form', async () => {
            const econtext = new Econtext(core, { ...props, showPayButton: true });
            render(econtext.render());

            const user = userEvent.setup();
            const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
            await user.click(payButton);

            await waitFor(() => {
                expect(screen.getByText('Enter your first name')).toBeInTheDocument();
            });
            expect(screen.getByText('Enter your last name')).toBeInTheDocument();
            expect(screen.getByText('Telephone number must be 10 or 11 digits long')).toBeInTheDocument();
            expect(screen.getByText('Enter the email address')).toBeInTheDocument();
        });

        test('should be invalid when form is not filled', () => {
            const econtext = new Econtext(core, props);
            render(econtext.render());

            expect(econtext.isValid).toBe(false);
        });
    });

    describe('Successful submit', () => {
        test('should be valid when all required fields are filled', async () => {
            const econtext = new Econtext(core, props);
            render(econtext.render());

            const user = userEvent.setup();

            const firstNameInput = await screen.findByLabelText('First name');
            const lastNameInput = await screen.findByLabelText('Last name');
            const telephoneInput = await screen.findByLabelText('Telephone number');
            const emailInput = await screen.findByLabelText('Email address');

            await user.type(firstNameInput, 'John');
            await user.type(lastNameInput, 'Doe');
            await user.type(telephoneInput, '09012345678');
            await user.type(emailInput, 'john.doe@example.com');
            await user.tab();

            await waitFor(() => {
                expect(econtext.isValid).toBe(true);
            });
        });

        test('should return correct data format when form is valid', async () => {
            const econtext = new Econtext(core, props);
            render(econtext.render());

            const user = userEvent.setup();

            const firstNameInput = await screen.findByLabelText('First name');
            const lastNameInput = await screen.findByLabelText('Last name');
            const telephoneInput = await screen.findByLabelText('Telephone number');
            const emailInput = await screen.findByLabelText('Email address');

            await user.type(firstNameInput, 'John');
            await user.type(lastNameInput, 'Doe');
            await user.type(telephoneInput, '09012345678');
            await user.type(emailInput, 'john.doe@example.com');
            await user.tab();

            await waitFor(() => {
                expect(econtext.data).toMatchObject({
                    paymentMethod: { type: 'econtext' },
                    shopperName: { firstName: 'John', lastName: 'Doe' },
                    telephoneNumber: '09012345678',
                    shopperEmail: 'john.doe@example.com'
                });
            });
        });

        test('should be valid immediately when personalDetailsRequired is false', () => {
            const econtext = new Econtext(core, { ...props, personalDetailsRequired: false });
            render(econtext.render());

            expect(econtext.isValid).toBe(true);
        });

        test('should call onSubmit when form is valid and pay button is clicked', async () => {
            const econtext = new Econtext(core, { ...props, showPayButton: true });
            render(econtext.render());

            const user = userEvent.setup();

            const firstNameInput = await screen.findByLabelText('First name');
            const lastNameInput = await screen.findByLabelText('Last name');
            const telephoneInput = await screen.findByLabelText('Telephone number');
            const emailInput = await screen.findByLabelText('Email address');

            await user.type(firstNameInput, 'John');
            await user.type(lastNameInput, 'Doe');
            await user.type(telephoneInput, '09012345678');
            await user.type(emailInput, 'john.doe@example.com');

            const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
            await user.click(payButton);

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('Voucher result without alternative reference', () => {
        test('should render voucher result with correct details when no alternativeReference', async () => {
            const econtext = new Econtext(core, {
                ...props,
                reference: '1234567890',
                expiresAt: '2024-12-31T23:59:59',
                paymentMethodType: 'econtext',
                maskedTelephoneNumber: '090****5678',
                collectionInstitutionNumber: '58091'
            });
            render(econtext.render());

            await expectVoucherDetailValue('Collection Institution Number', '58091');
            await expectVoucherDetailValue('Expiration Date', '12/31/2024, 11:59 PM');
            await expectVoucherDetailValue('Phone Number', '090****5678');

            expect(screen.getByText('1234567890')).toBeInTheDocument();

            expect(screen.queryByText('Customer number')).not.toBeInTheDocument();
            expect(screen.queryByText('Confirmation number')).not.toBeInTheDocument();
            expect(screen.queryByText('Use before')).not.toBeInTheDocument();
        });
    });

    describe('Voucher result with alternative reference', () => {
        test('should render voucher result with alternative reference details', async () => {
            const econtext = new Econtext(core, {
                ...props,
                reference: '1234567890',
                expiresAt: '2024-12-31T23:59:59',
                paymentMethodType: 'econtext',
                maskedTelephoneNumber: '090****5678',
                collectionInstitutionNumber: '58091',
                alternativeReference: 'ALT123456'
            });
            render(econtext.render());

            await expectVoucherDetailValue('Collection Institution Number', '58091');
            await expectVoucherDetailValue('Customer number', '1234567890');
            await expectVoucherDetailValue('Confirmation number', 'ALT123456');
            await expectVoucherDetailValue('Use before', '12/31/2024');
        });

        test('should not show masked telephone number and expiration date when alternative reference is present', () => {
            const econtext = new Econtext(core, {
                ...props,
                reference: '1234567890',
                expiresAt: '2024-12-31T23:59:59',
                paymentMethodType: 'econtext',
                maskedTelephoneNumber: '090****5678',
                collectionInstitutionNumber: '58091',
                alternativeReference: 'ALT123456'
            });
            render(econtext.render());

            expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
            expect(screen.queryByText('090****5678')).not.toBeInTheDocument();
            expect(screen.queryByText('Expiration Date')).not.toBeInTheDocument();
        });
    });
});
