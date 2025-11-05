import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import MealVoucherFR from './MealVoucherFR';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const flushPromises = () => new Promise(process.nextTick);

describe('MealVoucherFR Error Handling', () => {
    const i18n = global.i18n;
    const user = userEvent.setup();

    const baseProps = {
        ...global.commonCoreProps,
        clientKey: 'mock',
        amount: { value: 1000, currency: 'EUR' },
        name: 'Test Meal Voucher',
        type: 'mealVoucher_FR',
        brand: 'mealVoucher_FR',
        i18n,
        loadingContext: 'mock'
    };

    describe('Inherited Error Handling from GiftCard', () => {
        test('should display "no-balance" error message when balance is zero', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with zero balance (triggers no-balance error)
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const mealVoucher = new MealVoucherFR(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(mealVoucher.render());
            mealVoucher.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the no-balance error message (inherited from GiftCard)
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display "card-error" error message when card does not exist', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with no balance property (triggers card-error)
                resolve({});
            });

            const onError = jest.fn();
            const mealVoucher = new MealVoucherFR(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(mealVoucher.render());
            mealVoucher.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the card-error error message (inherited from GiftCard)
            expect(screen.getByText('In our records we have no gift card with this number')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display "currency-error" error message when currencies do not match', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with different currency (triggers currency-error)
                resolve({
                    balance: { value: 1000, currency: 'USD' }
                });
            });

            const onError = jest.fn();
            const mealVoucher = new MealVoucherFR(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(mealVoucher.render());
            mealVoucher.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the currency-error error message (inherited from GiftCard)
            expect(screen.getByText('Gift cards are only valid in the currency they were issued in')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('Error State Persistence for MealVoucher', () => {
        test('error message should persist after handleError is called', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with zero balance to trigger no-balance error
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const mealVoucher = new MealVoucherFR(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(mealVoucher.render());
            mealVoucher.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Manually trigger handleError (simulating what happens in the broken flow)
            // @ts-ignore - accessing protected method for testing
            mealVoucher.handleError(new AdyenCheckoutError('ERROR', 'Test error'));
            await flushPromises();

            // Error message should still be visible after handleError
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
        });

        test('component should be in ready state after error while preserving error message', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with no balance property to trigger card-error
                resolve({});
            });

            const onError = jest.fn();
            const mealVoucher = new MealVoucherFR(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(mealVoucher.render());
            mealVoucher.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Component should be in ready state (not loading)
            // @ts-ignore - accessing protected property for testing
            expect(mealVoucher.componentRef.state.status).toBe('ready');

            // But error message should still be displayed
            expect(screen.getByText('In our records we have no gift card with this number')).toBeInTheDocument();
        });
    });
});
