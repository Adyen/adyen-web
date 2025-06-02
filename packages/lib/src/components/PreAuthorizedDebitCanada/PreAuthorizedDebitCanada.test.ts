import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import PreAuthorizedDebitCanada from './PreAuthorizedDebitCanada';

describe('PreAuthorizedDebitCanada', () => {
    let onSubmitMock;
    let user;

    beforeEach(() => {
        onSubmitMock = jest.fn();
        user = userEvent.setup();
    });

    describe('Default component', () => {
        test('should submit the payment', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/i), '1234567');
            await user.type(screen.getByLabelText(/Institution number/), '123');
            await user.type(screen.getByLabelText(/Transit number/i), '12345');

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            ownerName: 'John Doe',
                            bankAccountNumber: '1234567',
                            bankCode: '123',
                            bankLocationId: '12345',
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            type: 'eft_directdebit_CA'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should show the info text about the settlement/authorization flow', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            expect(await screen.findByText('The funds will be withdrawn from your bank account within 1–3 business days.')).toBeVisible();
        });

        test('should submit the payment with the store consent given', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                enableStoreDetails: true,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/i), '1234567');
            await user.type(screen.getByLabelText(/Institution number/), '123');
            await user.type(screen.getByLabelText(/Transit number/i), '12345');
            await user.click(screen.getByLabelText(/Save for my next payment/i));

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            ownerName: 'John Doe',
                            bankAccountNumber: '1234567',
                            bankCode: '123',
                            bankLocationId: '12345',
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            type: 'eft_directdebit_CA'
                        }),
                        storePaymentMethod: true
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should show error if the account number is invalid (less than 7 digits)', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/i), '12345');
            await user.type(screen.getByLabelText(/Institution number/), '123');
            await user.type(screen.getByLabelText(/Transit number/i), '12345');
            await user.click(screen.getByLabelText(/Save for my next payment/i));

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter an account number that is between 7 and 12 digits')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should show error if the "institution number" is invalid (not 3 digits)', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/i), '1234567');
            await user.type(screen.getByLabelText(/Institution number/), '2');
            await user.type(screen.getByLabelText(/Transit number/i), '12345');
            await user.click(screen.getByLabelText(/Save for my next payment/i));

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter an institution number that consists of 3 digits')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should show error if the "transit number" is invalid (not 5 digits)', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.type(screen.getByLabelText(/Account holder name/i), 'John Doe');
            await user.type(screen.getByLabelText(/Account number/i), '1234567');
            await user.type(screen.getByLabelText(/Institution number/), '123');
            await user.type(screen.getByLabelText(/Transit number/i), '1');
            await user.click(screen.getByLabelText(/Save for my next payment/i));

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter a transit number that consists of 5 digits')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        test('should show error if fields are empty when pay button is clicked', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel }
            });

            render(preAuthorizedDebitCanada.render());

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(await screen.findByText('Enter an account holder name')).toBeVisible();
            expect(await screen.findByText('Enter an account number that is between 7 and 12 digits')).toBeVisible();
            expect(await screen.findByText('Enter an institution number that consists of 3 digits')).toBeVisible();
            expect(await screen.findByText('Enter a transit number that consists of 5 digits')).toBeVisible();
            expect(onSubmitMock).not.toHaveBeenCalled();
        });
    });

    describe('Stored component', () => {
        test('should submit the payment', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel },
                storedPaymentMethodId: 'PAYMENT-METHOD-ID'
            });

            render(preAuthorizedDebitCanada.render());

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            storedPaymentMethodId: 'PAYMENT-METHOD-ID',
                            type: 'eft_directdebit_CA'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should show the info text about the settlement/authorization flow', async () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel },
                storedPaymentMethodId: 'PAYMENT-METHOD-ID'
            });

            render(preAuthorizedDebitCanada.render());

            expect(await screen.findByText('The funds will be withdrawn from your bank account within 1–3 business days.')).toBeVisible();
        });

        test('should get the display name and additional info from the props', () => {
            const preAuthorizedDebitCanada = new PreAuthorizedDebitCanada(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, analytics: global.analytics, srPanel: global.srPanel },
                storedPaymentMethodId: 'PAYMENT-METHOD-ID',
                lastFour: '1234',
                label: 'bank name'
            });

            expect(preAuthorizedDebitCanada.displayName).toBe('•••• 1234');
            expect(preAuthorizedDebitCanada.additionalInfo).toBe('bank name');
        });
    });
});
