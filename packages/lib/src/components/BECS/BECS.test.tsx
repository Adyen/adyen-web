import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';
import BECS from './BECS';

import type { BECSConfiguration } from './types';

const RESULT_URL = 'https://example.com/direct-debit-agreement.pdf';

const renderBECS = (props: BECSConfiguration = {}, core = setupCoreMock()) => {
    const becs = new BECS(core, {
        modules: { resources: core.modules.resources },
        i18n: core.modules.i18n,
        loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        ...props
    });

    render(becs.render());
};

describe('BECS Direct Debit', () => {
    test('should submit Australian bank account details', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        renderBECS({ onSubmit });

        await user.type(await screen.findByLabelText('Account holder name'), 'Alex Smith');
        const bsbInput = screen.getByLabelText('BSB');
        await user.type(bsbInput, '123456');
        expect(bsbInput).toHaveValue('123-456');
        await user.type(screen.getByLabelText('Account number'), '123456789');
        await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    paymentMethod: {
                        bankAccountNumber: '123456789',
                        bankBranchCode: '123456',
                        checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                        holderName: 'Alex Smith',
                        sdkData: expect.any(String),
                        type: 'directdebit_AU'
                    },
                    riskData: { clientData: TEST_RISK_DATA },
                    shopperEmail: 'alex@example.com',
                    clientStateDataIndicator: true
                }
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should render the result with caller-composed download actions', () => {
        renderBECS({ url: RESULT_URL });

        expect(screen.getByRole('heading', { name: 'Success!' })).toBeInTheDocument();
        expect(screen.getByText('Your account is authorized, you can close this page')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(2);
        expect(screen.getByRole('link', { name: 'Download Authorised Direct Debit Request' })).toHaveAttribute('href', RESULT_URL);
        expect(screen.getByRole('link', { name: 'Read Direct Debit Request Service Agreement' })).toHaveAttribute(
            'href',
            'https://www.adyen.com/en_AU/legal/'
        );
    });

    test('should call onActionHandled once when the result is presented', () => {
        const onActionHandled = jest.fn();
        renderBECS({ type: 'voucher', paymentMethodType: 'directdebit_AU', url: RESULT_URL, onActionHandled });
        expect(onActionHandled).toHaveBeenCalledTimes(1);
        expect(onActionHandled).toHaveBeenCalledWith(
            expect.objectContaining({ componentType: 'directdebit_AU', actionDescription: 'voucher-presented' })
        );
    });

    test('should announce the success message to screen readers when the result is presented', () => {
        const core = setupCoreMock();
        const setMessagesSpy = jest.spyOn(core.modules.srPanel, 'setMessages');
        renderBECS({ url: RESULT_URL }, core);
        expect(setMessagesSpy).toHaveBeenCalledWith('Your account is authorized, you can close this page');
    });

    test('should show an invalid email error on blur', async () => {
        const user = userEvent.setup();
        renderBECS();

        await user.type(await screen.findByLabelText('Email address'), 'invalid');
        await user.tab();

        expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });

    test('should show a required email error when an empty field loses focus', async () => {
        const user = userEvent.setup();
        renderBECS();

        await user.click(await screen.findByLabelText('Email address'));
        await user.tab();

        expect(screen.getByText('Enter the email address')).toBeInTheDocument();
    });

    test('should reject an account holder name containing only spaces', async () => {
        const user = userEvent.setup();
        renderBECS();
        await user.type(await screen.findByLabelText('Account holder name'), '   ');
        await user.tab();
        expect(screen.getByText('Enter an account holder name')).toBeInTheDocument();
    });

    test('should limit the account number to 9 digits', async () => {
        const user = userEvent.setup();
        renderBECS();

        const accountNumberInput = await screen.findByLabelText('Account number');
        await user.type(accountNumberInput, '1234567890');
        expect(accountNumberInput).toHaveValue('123456789');
    });

    test('should show an account number error when an empty field loses focus', async () => {
        const user = userEvent.setup();
        renderBECS();

        await user.click(await screen.findByLabelText('Account number'));
        await user.tab();

        expect(screen.getByText('Enter a valid account number')).toBeInTheDocument();
    });

    test('should show an account number error when fewer than 6 digits are entered', async () => {
        const user = userEvent.setup();
        renderBECS();

        await user.type(await screen.findByLabelText('Account number'), '12345');
        await user.tab();

        expect(screen.getByText('Enter a valid account number')).toBeInTheDocument();
    });

    test('should show validation errors and not submit invalid details', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        renderBECS({ onSubmit });

        await user.type(await screen.findByLabelText('BSB'), '12345');
        await user.type(screen.getByLabelText('Account number'), '1234');
        await user.type(screen.getByLabelText('Email address'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(screen.getByText('Enter an account holder name')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid 6-digit BSB')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid account number')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
