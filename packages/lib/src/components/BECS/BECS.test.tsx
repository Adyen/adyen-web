import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';
import BECS from './BECS';

describe('BECS Direct Debit', () => {
    test('should submit Australian bank account details', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        const core = setupCoreMock();
        const becs = new BECS(core, {
            modules: { resources: core.modules.resources },
            i18n: core.modules.i18n,
            onSubmit,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(becs.render());

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

    test('should show validation errors and not submit invalid details', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        const core = setupCoreMock();
        const becs = new BECS(core, {
            modules: { resources: core.modules.resources },
            i18n: core.modules.i18n,
            onSubmit,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(becs.render());

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
