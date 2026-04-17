import defaultProps from './defaultProps';

describe('defaultProps', () => {
    test('should have the correct default values', () => {
        expect(defaultProps.configuration).toEqual({});
        expect(defaultProps.environment).toBe('TEST');
        expect(defaultProps.locale).toBe('en_GB');
        expect(defaultProps.placement).toBe('Cart');
        expect(defaultProps.productType).toBe('PayAndShip');
        expect(defaultProps.showOrderButton).toBe(true);
        expect(defaultProps.showChangePaymentDetailsButton).toBe(false);
        expect(defaultProps.showSignOutButton).toBe(false);
        expect(defaultProps.isExpress).toBe(false);
    });

    test('should set cancelUrl to current window location', () => {
        expect(defaultProps.cancelUrl).toBe(window.location.href);
    });

    test('should set returnUrl to current window location', () => {
        expect(defaultProps.returnUrl).toBe(window.location.href);
    });

    test('onClick should resolve immediately', async () => {
        const resolve = jest.fn();
        await defaultProps.onClick(resolve, jest.fn());
        expect(resolve).toHaveBeenCalled();
    });

    test('onSignOut should resolve immediately', async () => {
        const resolve = jest.fn();
        await defaultProps.onSignOut(resolve, jest.fn());
        expect(resolve).toHaveBeenCalled();
    });
});
