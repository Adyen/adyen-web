import BacsDD from './BacsDD';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

describe('Bacs Direct Debit', () => {
    test('should make a Bacs Direct Debit payment', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();

        const bacs = new BacsDD(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(bacs.render());

        const accountNameInput = await screen.findByLabelText('Bank account holder name');
        const accountNumberInput = await screen.findByLabelText('Bank account number');
        const sortCodeInput = await screen.findByLabelText('Sort code');
        const emailInput = await screen.findByLabelText('Email address');

        await user.type(accountNameInput, 'David Archer');
        await user.type(accountNumberInput, '40308669');
        await user.type(sortCodeInput, '560036');
        await user.type(emailInput, 'jon@adyen.com');

        const consentCheckbox = await screen.findByRole('checkbox', { name: /I agree that the above amount/i, exact: false });
        const accountConsentCheckbox = await screen.findByRole('checkbox', { name: /I confirm the account is in my name/i, exact: false });

        await user.click(consentCheckbox);
        await user.click(accountConsentCheckbox);

        const continueButton = await screen.findByRole('button', { name: 'Continue' });
        await user.click(continueButton);

        const payButton = await screen.findByRole('button', { name: 'Confirm and pay', exact: false });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    paymentMethod: {
                        bankAccountNumber: '40308669',
                        bankLocationId: '560036',
                        checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                        holderName: 'David Archer',
                        type: 'directdebit_GB'
                    },
                    shopperEmail: 'jon@adyen.com',
                    clientStateDataIndicator: true
                }
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should not let shopper continue if email is wrong or checkboxes are not checked', async () => {
        const user = userEvent.setup();

        const onSubmitMock = jest.fn();

        const bacs = new BacsDD(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        const { container } = render(bacs.render());

        const accountNameInput = await screen.findByLabelText('Bank account holder name');
        const accountNumberInput = await screen.findByLabelText('Bank account number');
        const sortCodeInput = await screen.findByLabelText('Sort code');
        const emailInput = await screen.findByLabelText('Email address');

        await user.type(accountNameInput, 'David Archer');
        await user.type(accountNumberInput, '40308669');
        await user.type(sortCodeInput, '560036');
        await user.type(emailInput, 'jon@adyen');

        const continueButton = await screen.findByRole('button', { name: 'Continue' });
        await user.click(continueButton);

        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        const [consentCheckboxContainer, accountConsentCheckboxContainer] = container.querySelectorAll('.adyen-checkout__field--consentCheckbox');
        expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
        expect(within(<HTMLElement>consentCheckboxContainer).getByAltText('Error')).toBeInTheDocument();
        expect(within(<HTMLElement>accountConsentCheckboxContainer).getByAltText('Error')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirm and pay', exact: false })).not.toBeInTheDocument();
    });

    test('should allow shopper to Edit the details before making the payment', async () => {
        const user = userEvent.setup();

        const onSubmitMock = jest.fn();

        const bacs = new BacsDD(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(bacs.render());

        const accountNameInput = await screen.findByLabelText('Bank account holder name');
        const accountNumberInput = await screen.findByLabelText('Bank account number');
        const sortCodeInput = await screen.findByLabelText('Sort code');
        const emailInput = await screen.findByLabelText('Email address');

        await user.type(accountNameInput, 'David Archer');
        await user.type(accountNumberInput, '40308669');
        await user.type(sortCodeInput, '560036');
        await user.type(emailInput, 'jon@adyen.com');

        const consentCheckbox = await screen.findByRole('checkbox', { name: /I agree that the above amount/i, exact: false });
        const accountConsentCheckbox = await screen.findByRole('checkbox', { name: /I confirm the account is in my name/i, exact: false });

        await user.click(consentCheckbox);
        await user.click(accountConsentCheckbox);

        const continueButton = await screen.findByRole('button', { name: 'Continue' });
        await user.click(continueButton);

        expect(accountNameInput).toHaveAttribute('readonly');
        expect(accountNumberInput).toHaveAttribute('readonly');
        expect(sortCodeInput).toHaveAttribute('readonly');
        expect(emailInput).toHaveAttribute('readonly');

        const editButton = await screen.findByLabelText('Edit');
        await user.click(editButton);

        expect(accountNameInput).not.toHaveAttribute('readonly');
        expect(accountNumberInput).not.toHaveAttribute('readonly');
        expect(sortCodeInput).not.toHaveAttribute('readonly');
        expect(emailInput).not.toHaveAttribute('readonly');

        await user.clear(accountNameInput);
        await user.clear(accountNumberInput);
        await user.clear(sortCodeInput);
        await user.clear(emailInput);

        await user.type(accountNameInput, 'Jonny R.');
        await user.type(accountNumberInput, '89345768');
        await user.type(sortCodeInput, '895302');
        await user.type(emailInput, 'jonnyr@adyen.com');

        await user.click(continueButton);

        const payButton = await screen.findByRole('button', { name: 'Confirm and pay', exact: false });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    paymentMethod: {
                        bankAccountNumber: '89345768',
                        bankLocationId: '895302',
                        checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                        holderName: 'Jonny R.',
                        type: 'directdebit_GB'
                    },
                    shopperEmail: 'jonnyr@adyen.com',
                    clientStateDataIndicator: true
                }
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should render the Voucher when the URL is retrieved', () => {
        const bacs = new BacsDD(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
            url: 'https://test.adyen.com/hpp/generateDdi.shtml?pdfFields=%2BjXS7Uo2RhBavkz'
        });

        render(bacs.render());

        expect(screen.getByText('Download your Direct Debit Instruction (DDI / Mandate)')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Download PDF/i })).toBeInTheDocument();
    });
});
