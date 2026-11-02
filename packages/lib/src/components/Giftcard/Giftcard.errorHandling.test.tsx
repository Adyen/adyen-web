import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Giftcard from './Giftcard';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

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
            const core = setupCoreMock();
            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with zero balance (triggers no-balance error)
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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
            const core = setupCoreMock();
            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with no balance property (triggers card-error)
                resolve({});
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Simulate successful balance check but with different currency (triggers currency-error)
                resolve({
                    balance: { value: 1000, currency: 'USD' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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

        test('should display a banner, and no inline error, when the merchant rejects with an arbitrary error', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn((resolve, reject) => {
                reject(new Error('something went wrong'));
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByRole('alert')).toHaveTextContent('An unknown error occurred');

            // A generic failure is not a card number problem, so no inline error
            expect(screen.queryByText('In our records we have no gift card with this number')).not.toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display the "card-error" inline message when the API rejects the card details', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn((resolve, reject) => {
                reject(
                    new AdyenCheckoutError('NETWORK_ERROR', 'Unable To Process', {
                        cause: { errorCode: '904', message: 'Unable To Process', errorType: 'validation', status: 422 }
                    })
                );
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByText('In our records we have no gift card with this number')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });

        test('should display a banner when the API fails with a server error', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn((resolve, reject) => {
                reject(
                    new AdyenCheckoutError('NETWORK_ERROR', 'Internal error', {
                        cause: { errorCode: '903', message: 'Internal error', errorType: 'internal', status: 500 }
                    })
                );
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByRole('alert')).toHaveTextContent('An unknown error occurred');
            expect(screen.queryByText('In our records we have no gift card with this number')).not.toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('Error State Persistence', () => {
        test('error message should persist after handleError is called', async () => {
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with zero balance to trigger no-balance error
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                });
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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
            const core = setupCoreMock();

            const onBalanceCheck = jest.fn(resolve => {
                // Resolve with no balance property to trigger card-error
                resolve({});
            });

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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
            const core = setupCoreMock();

            const mockSession = {
                checkBalance: jest.fn().mockResolvedValue({
                    balance: { value: 0, currency: 'EUR' }
                })
            };

            const onError = jest.fn();
            const giftcard = new Giftcard(core, {
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

    /**
     * Each attempt clears both channels up front. Asserting this across two *failing* attempts, rather than a
     * succeeding one, keeps GiftcardResult from swapping the view out and masking whether clearing really happened.
     */
    describe('Error Message Clearing', () => {
        test('should clear an inline error when a later attempt produces a banner', async () => {
            const core = setupCoreMock();

            let isFirstAttempt = true;
            const onBalanceCheck = jest.fn((resolve, reject) => {
                if (isFirstAttempt) {
                    isFirstAttempt = false;
                    // Zero balance triggers the inline no-balance error
                    resolve({ balance: { value: 0, currency: 'EUR' } });
                    return;
                }
                reject(new Error('something went wrong'));
            });

            const giftcard = new Giftcard(core, { ...baseProps, onBalanceCheck, onError: jest.fn() });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();

            await user.click(payButton);
            await flushPromises();

            expect(screen.queryByText('This gift card has zero balance')).not.toBeInTheDocument();
            expect(screen.getByRole('alert')).toHaveTextContent('An unknown error occurred');
        });

        test('should clear a banner when a later attempt produces an inline error', async () => {
            const core = setupCoreMock();

            let isFirstAttempt = true;
            const onBalanceCheck = jest.fn((resolve, reject) => {
                if (isFirstAttempt) {
                    isFirstAttempt = false;
                    reject(new Error('something went wrong'));
                    return;
                }
                resolve({ balance: { value: 0, currency: 'EUR' } });
            });

            const giftcard = new Giftcard(core, { ...baseProps, onBalanceCheck, onError: jest.fn() });

            render(giftcard.render());
            giftcard.setState({ isValid: true });

            const payButton = await screen.findByRole('button');
            await user.click(payButton);
            await flushPromises();

            expect(screen.getByRole('alert')).toBeInTheDocument();

            await user.click(payButton);
            await flushPromises();

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.getByText('This gift card has zero balance')).toBeInTheDocument();
        });
    });
});
