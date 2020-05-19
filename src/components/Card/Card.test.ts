import { CardElement } from './Card';

describe('Card', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.card).toBe('123');
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const card = new CardElement({});
            expect(card.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.isValid).toBe(true);
        });
    });
});
