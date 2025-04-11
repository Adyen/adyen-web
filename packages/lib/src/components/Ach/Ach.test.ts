import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import Ach from './Ach';

describe('ACH', () => {
    let onSubmitMock;
    let user;

    beforeEach(() => {
        onSubmitMock = jest.fn();
        user = userEvent.setup();
    });

    describe('Default component', () => {
        test('should submit the payment', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            ownerName: 'John Doe',
                            type: 'ach'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should submit the payment with the store consent given', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            ownerName: 'John Doe',
                            type: 'ach'
                        }),
                        storePaymentMethod: true
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should not submit the payment if the account number does not match', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(await screen.findByText('Account number does not match')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should not submit the payment if the account number is invalid', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(await screen.findByText('Enter the complete bank account number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should show error if routing number is invalid (not 9 numbers)', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(await screen.findByText('Enter the bank routing number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();

            await user.type(screen.getByLabelText(/Routing number/i), '12345');
            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));
            expect(await screen.findByText('Enter the complete bank routing number')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();

            await user.type(screen.getByLabelText(/Routing number/i), '123456789');
            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
        });

        test('should hide the holder name if configuration is set to hide it', async () => {
            const ach = new Ach(global.core, {
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

            await user.click(screen.queryByRole('button', { name: 'Confirm purchase' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            accountHolderType: 'personal',
                            bankAccountNumber: '1234567890',
                            bankAccountType: 'checking',
                            bankLocationId: '121000358',
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            type: 'ach'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should use the correct values in the account type selector', async () => {
            const onChangeMock = jest.fn();

            const ach = new Ach(global.core, {
                onChange: onChangeMock,
                hasHolderName: false,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics }
            });

            render(ach.render());

            await user.click(screen.queryByPlaceholderText('Choose an account type'));
            await user.click(screen.queryByRole('option', { name: 'Personal Checking Account' }));

            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.accountHolderType).toBe('personal');
            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.bankAccountType).toBe('checking');

            await user.click(screen.queryByRole('button', { name: 'Personal Checking Account' }));
            await user.click(screen.queryByRole('option', { name: 'Personal Savings Account' }));

            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.accountHolderType).toBe('personal');
            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.bankAccountType).toBe('savings');

            await user.click(screen.queryByRole('button', { name: 'Personal Savings Account' }));
            await user.click(screen.queryByRole('option', { name: 'Business Checking Account' }));

            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.accountHolderType).toBe('business');
            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.bankAccountType).toBe('checking');

            await user.click(screen.queryByRole('button', { name: 'Business Checking Account' }));
            await user.click(screen.queryByRole('option', { name: 'Business Savings Account' }));

            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.accountHolderType).toBe('business');
            expect(onChangeMock.mock.lastCall[0].data.paymentMethod.bankAccountType).toBe('savings');
        });
    });

    describe('Stored component', () => {
        test('should submit the payment', async () => {
            const ach = new Ach(global.core, {
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
