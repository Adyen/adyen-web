import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Giftcard from './Giftcard';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

const flushPromises = () => new Promise(process.nextTick);

describe('Giftcard Error Handling', () => {
    const i18n = global.i18n;
    const user = userEvent.setup();

    const baseProps = {
        ...global.commonCoreProps,
        clientKey: 'mock',
        amount: { value: 1000, currency: 'EUR' },
        name: 'Test Gift Card',
        type: 'giftcard',
        brand: 'genericgiftcard',
        i18n,
        loadingContext: 'mock'
    };

    describe('Balance Check Error Messages', () => {
        test('should display "no-balance" error message when balance is zero', async () => {
            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with zero balance (triggers no-balance error)
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the no-balance error message
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display "card-error" error message when card does not exist', async () => {
            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with no balance property (triggers card-error)
                resolve({});
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the card-error error message
            expect(screen.getByText('In our records we have no gift card with this number')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display "currency-error" error message when currencies do not match', async () => {
            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with different currency (triggers currency-error)
                resolve({
                    balance: { value: 1000, currency: 'USD' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the currency-error error message
            expect(screen.getByText('Gift cards are only valid in the currency they were issued in')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should not display any message for unknown errors', async () => {
            const onBalanceCheck = jest.fn((resolve, reject) => {
                // Simulate the balance check rejecting with an unknown error
                reject(new Error('unknown-error'));
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should not display any specific error message for unknown errors
            expect(screen.queryByText('This gift card has zero balance')).not.toBeInTheDocument();
            expect(screen.queryByText('In our records we have no gift card with this number')).not.toBeInTheDocument();
            expect(screen.queryByText('Gift cards are only valid in the currency they were issued in')).not.toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('Error State Persistence', () => {
        test('error message should persist after handleError is called', async () => {
            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with zero balance to trigger no-balance error
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Manually trigger handleError (simulating what happens in the broken flow)
            // @ts-ignore - accessing protected method for testing
            giftcard.handleError(new AdyenCheckoutError('ERROR', 'Test error'));
            await flushPromises();

            // Error message should still be visible after handleError
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
        });

        test('component should be in ready state after error while preserving error message', async () => {
            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with no balance property to trigger card-error
                resolve({});
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Component should be in ready state (not loading)
            // @ts-ignore - accessing protected property for testing
            expect(giftcard.componentRef.state.status).toBe('ready');

            // But error message should still be displayed
            expect(screen.getByText('In our records we have no gift card with this number')).toBeInTheDocument();
        });
    });

    describe('Session Flow Error Handling', () => {
        test('should handle session balance check errors correctly', async () => {
            const mockSession = {
                checkBalance: jest.fn().mockResolvedValue({
                    balance: { value: 0, currency: 'EUR' }
                })
            };

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                session: mockSession,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            // Should display the no-balance error message
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('Error Message Clearing', () => {
        test('error message should clear when balance check succeeds', async () => {
            let shouldFail = true;
            const onBalanceCheck = jest.fn(resolve => {
                if (shouldFail) {
                    // First call: resolve with zero balance to trigger no-balance error
                    resolve({ balance: { value: 0, currency: 'EUR' } });
                } else {
                    // Second call: resolve with valid balance
                    resolve({ balance: { value: 2000, currency: 'EUR' } });
                }
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            // First attempt - should fail
            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();

            // Second attempt - should succeed
            shouldFail = false;
            await user.click(payButton);
            await flushPromises();

            // Error message should be cleared
            expect(screen.queryByText('This gift card has zero balance')).not.toBeInTheDocument();
            // Should show balance confirmation instead
            expect(screen.getByText('Gift card balance')).toBeInTheDocument();
        });
    });
});
