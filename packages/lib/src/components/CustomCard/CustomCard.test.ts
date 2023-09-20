import CustomCard from './CustomCard';

describe('CustomCard', () => {
    let customCard;

    beforeEach(() => {
        customCard = new CustomCard({ core: null, styles: null, brand: null });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            expect(customCard.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            customCard.setState({ data: { test: '123' }, isValid: true });
            expect(customCard.data.paymentMethod.test).toBe('123');
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            expect(customCard.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            customCard.setState({ data: { test: '123' }, isValid: true });
            expect(customCard.isValid).toBe(true);
        });
    });
});
