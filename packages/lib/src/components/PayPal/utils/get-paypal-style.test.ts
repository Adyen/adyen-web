import { getStyle } from './get-paypal-styles';

describe('getStyle', () => {
    test('return the same styles for the regular PayPal button', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('paypal', style)).toEqual(style);
    });

    test('remove the unsupported color for PayPal Credit', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('credit', style)).toEqual({ height: 48 });
    });
});
