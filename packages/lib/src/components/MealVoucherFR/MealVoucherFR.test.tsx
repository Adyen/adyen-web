import userEvent from '@testing-library/user-event';
import MealVoucherFR from './MealVoucherFR';
import { render, screen } from '@testing-library/preact';

describe('MealVoucherFR', () => {
    const resources = global.resources;
    const i18n = global.i18n;
    const user = userEvent.setup();

    const baseProps = {
        modules: { resources, analytics: { sendAnalytics: () => {} } },
        amount: { value: 1000, currency: 'EUR' },
        name: 'MealVoucher',
        showPayButton: true,
        i18n,
        loadingContext: 'mock'
    };

    // test only the layout of MealVoucher since the logic comes from Giftcard
    describe('layout of mealvoucher', () => {
        test('should also display expiry date', async () => {
            const onBalanceCheck = jest.fn();

            // mounting and clicking pay button
            const mealVoucherFR = new MealVoucherFR({
                ...baseProps,
                onBalanceCheck
            });
            render(mealVoucherFR.render());
            // skip feeling in fields
            mealVoucherFR.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            const card = await screen.findByText('Card number');
            const expiryDate = await screen.findByText('Expiry date');
            const cvc = await screen.findByText('Security code');

            // expiry date is not available in the regular gift card
            expect(card).toBeInTheDocument();
            expect(expiryDate).toBeInTheDocument();
            expect(cvc).toBeInTheDocument();
        });
    });

    // this tests are useful so it's obvious changes on giftcard will also affect behaviour on MealVoucher
    describe('basic gift card tests', () => {
        test('onBalanceCheck should be called on pay button click', async () => {
            const onBalanceCheck = jest.fn();

            // mounting and clicking pay button
            const mealVoucherFR = new MealVoucherFR({
                ...baseProps,
                onBalanceCheck
            });
            render(mealVoucherFR.render());
            // skip feeling in fields
            mealVoucherFR.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onBalanceCheck).toHaveBeenCalled();
        });

        test('after creating an order we should call submit / payments endpoint', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 500, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn(resolve =>
                resolve({
                    orderData: 'mock',
                    pspReference: 'mock'
                })
            );
            const onSubmit = jest.fn();

            // mounting and clicking pay button
            const mealVoucherFR = new MealVoucherFR({
                ...baseProps,
                onBalanceCheck,
                onOrderRequest,
                onSubmit
            });
            render(mealVoucherFR.render());
            mealVoucherFR.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onSubmit).toHaveBeenCalled();
        });
    });
});
