import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import Ach from './Ach';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';

describe('ACH', () => {
    let onSubmitMock;
    let user;

    beforeEach(() => {
        onSubmitMock = jest.fn();
        user = userEvent.setup();
    });

    describe('Default component', () => {
        test('should submit the payment', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Routing number/i), '121000358');
            await user.type(screen.getByLabelText(/Account number/), '1234567890');
            await user.type(screen.getByLabelText(/Verify account number/i), '1234567890');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                            ownerName: 'John Doe',
                            type: 'ach'
                        }),
                        riskData: {
                            clientData: TEST_RISK_DATA
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should submit the payment with the store consent given', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                enableStoreDetails: true,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Routing number/i), '121000358');
            await user.type(screen.getByLabelText(/Account number/), '1234567890');
            await user.type(screen.getByLabelText(/Verify account number/i), '1234567890');

            await user.click(screen.getByLabelText(/Save for my next payment/i));

            await waitFor(() => {
                expect(ach.state.storePaymentMethod).toBe(true);
            });

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                            ownerName: 'John Doe',
                            type: 'ach'
                        }),
                        riskData: {
                            clientData: TEST_RISK_DATA
                        },
                        storePaymentMethod: true
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should not submit the payment if the account number does not match', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));
            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Routing number/i), '121000358');
            await user.type(screen.getByLabelText(/Account number/), '12345');
            await user.type(screen.getByLabelText(/Verify account number/i), '4321');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Account number does not match')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should not submit the payment if the account number is invalid', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));
            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Routing number/i), '121000358');
            await user.type(screen.getByLabelText(/Account number/), '123');
            await user.type(screen.getByLabelText(/Verify account number/i), '123');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter the complete bank account number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should show error if routing number is invalid (not 9 numbers)', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));
            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/), '1234567890');
            await user.type(screen.getByLabelText(/Verify account number/i), '1234567890');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter the bank routing number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();

            await user.type(screen.getByLabelText(/Routing number/i), '12345');
            await user.click(screen.queryByRole('button', { name: /Pay/i }));
            expect(await screen.findByText('Enter the complete bank routing number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();

            await user.type(screen.getByLabelText(/Routing number/i), '123456789');
            await user.click(screen.queryByRole('button', { name: /Pay/i }));
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
        });

        test('should hide the holder name if configuration is set to hide it', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                hasHolderName: false,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            expect(screen.queryByLabelText(/Account holder name/i)).toBeNull();

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));

            await user.type(screen.getByLabelText(/Routing number/i), '121000358');
            await user.type(screen.getByLabelText(/Account number/), '1234567890');
            await user.type(screen.getByLabelText(/Verify account number/i), '1234567890');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                            type: 'ach'
                        }),
                        riskData: {
                            clientData: TEST_RISK_DATA
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should use the correct values in the account type selector', async () => {
            const core = setupCoreMock();
            const onChangeMock = jest.fn();

            const ach = new Ach(core, {
                onChange: onChangeMock,
                hasHolderName: false,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));

            await waitFor(() => {
                expect(onChangeMock.mock.lastCall[0].data.paymentMethod).toEqual(
                    expect.objectContaining({
                        accountHolderType: 'personal',
                        bankAccountType: 'checking'
                    })
                );
            });

            await user.click(screen.queryByRole('button', { name: 'Personal Checking Account' }));
            await user.click(screen.queryByRole('option', { name: 'Personal Savings Account' }));

            await waitFor(() => {
                expect(onChangeMock.mock.lastCall[0].data.paymentMethod).toEqual(
                    expect.objectContaining({
                        accountHolderType: 'personal',
                        bankAccountType: 'savings'
                    })
                );
            });

            await user.click(screen.queryByRole('button', { name: 'Personal Savings Account' }));
            await user.click(screen.queryByRole('option', { name: 'Business Checking Account' }));

            await waitFor(() => {
                expect(onChangeMock.mock.lastCall[0].data.paymentMethod).toEqual(
                    expect.objectContaining({
                        accountHolderType: 'business',
                        bankAccountType: 'checking'
                    })
                );
            });

            await user.click(screen.queryByRole('button', { name: 'Business Checking Account' }));
            await user.click(screen.queryByRole('option', { name: 'Business Savings Account' }));

            await waitFor(() => {
                expect(onChangeMock.mock.lastCall[0].data.paymentMethod).toEqual(
                    expect.objectContaining({
                        accountHolderType: 'business',
                        bankAccountType: 'savings'
                    })
                );
            });
        });

        test('should prefill the account holder name', () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                data: { ownerName: 'John doe' },
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            expect(screen.getByLabelText('Account holder name')).toHaveValue('John doe');
        });
    });

    describe('Stored component', () => {
        test('should submit the payment', async () => {
            const core = setupCoreMock();

            const ach = new Ach(core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics },
                storedPaymentMethodId: 'PAYMENT-METHOD-ID',
                bankAccountNumber: '123123'
            });

            render(ach.render());

            await user.click(screen.queryByRole('button', { name: 'Continue to •••• 3123' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            storedPaymentMethodId: 'PAYMENT-METHOD-ID',
                            type: 'ach'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });
});
