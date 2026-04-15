import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Dragonpay from './Dragonpay';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';
import PaymentMethods from '../../core/ProcessResponse/PaymentMethods';

const paymentMethods = new PaymentMethods({
    paymentMethods: [
        {
            type: 'dragonpay_ebanking',
            name: 'Dragonpay',
            issuers: [
                {
                    id: 'BDO',
                    name: 'BDO Internet Banking'
                },
                {
                    id: 'BDRE',
                    name: 'BDO Retail E-Payments'
                }
            ]
        },
        {
            type: 'dragonpay_otc_non_banking',
            name: 'Dragonpay Non-Banking',
            issuers: [
                {
                    id: 'BDO',
                    name: 'BDO Internet Banking'
                }
            ]
        },
        {
            name: 'Convenience Stores',
            type: 'dragonpay_otc_philippines'
        }
    ]
});

describe('Dragonpay', () => {
    describe('rendering form', () => {
        test('should render issuer select field when type requires issuer (dragonpay_ebanking)', () => {
            const core = setupCoreMock({ paymentMethods });
            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_ebanking',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.getByLabelText(/select your bank/i)).toBeInTheDocument();
        });

        test('should render issuer select field with non-bank label for dragonpay_otc_non_banking', () => {
            const core = setupCoreMock({ paymentMethods });
            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_otc_non_banking',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.getByLabelText(/select your provider/i)).toBeInTheDocument();
        });

        test('should not render issuer select field when type does not require issuer', () => {
            const core = setupCoreMock({ paymentMethods });
            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_otc_philippines',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.getByLabelText('Email address')).toBeInTheDocument();
            expect(screen.queryByLabelText(/select your bank/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/select your non-bank/i)).not.toBeInTheDocument();
        });

        test('should render pay button when showPayButton is true', () => {
            const core = setupCoreMock({ paymentMethods });
            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_otc_philippines',
                showPayButton: true,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.getByRole('button', { name: /confirm purchase/i })).toBeInTheDocument();
        });

        test('should not render pay button when showPayButton is false', () => {
            const core = setupCoreMock({ paymentMethods });
            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_otc_philippines',
                showPayButton: false,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.queryByRole('button', { name: /confirm purchase/i })).not.toBeInTheDocument();
        });

        test('should render all issuer items in select dropdown', () => {
            const core = setupCoreMock({ paymentMethods });

            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_ebanking',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            expect(screen.getByRole('option', { name: /BDO Internet Banking/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /BDO Retail E-Payments/i })).toBeInTheDocument();
        });
    });

    describe('validation and error display', () => {
        test('should show email validation error when submitting with empty email', async () => {
            const core = setupCoreMock({ paymentMethods });
            const user = userEvent.setup();

            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_ebanking',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });
            render(dragonpay.render());

            await user.click(screen.queryByRole('button', { name: /confirm purchase/i }));

            await waitFor(() => {
                expect(screen.getByText(/Enter the email address/i)).toBeInTheDocument();
            });
        });
    });

    describe('form submission with valid data', () => {
        test('should format data correctly when submitting valid form', async () => {
            const user = userEvent.setup();
            const core = setupCoreMock({ paymentMethods });
            const onSubmit = jest.fn();

            const dragonpay = new Dragonpay(core, {
                type: 'dragonpay_ebanking',
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources },
                onSubmit
            });

            render(dragonpay.render());

            await user.type(screen.getByLabelText('Email address'), 'test@example.com');

            await user.click(screen.getByLabelText(/select your bank/i));
            await user.click(screen.getByRole('option', { name: /BDO Internet Banking/i }));

            await user.click(screen.getByRole('button', { name: /confirm purchase/i }));

            expect(onSubmit).toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        paymentMethod: {
                            type: 'dragonpay_ebanking',
                            issuer: 'BDO',
                            sdkData: expect.any(String),
                            checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID
                        },
                        riskData: {
                            clientData: TEST_RISK_DATA
                        },
                        clientStateDataIndicator: true,
                        shopperEmail: 'test@example.com'
                    }
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });
});
