import SecuredFields from './SecuredFields';

describe('SecuredFields', () => {
    let securedFields;

    beforeEach(() => {
        securedFields = new SecuredFields({});
    });

    describe('get data', () => {
        test('always returns a type', () => {
            expect(securedFields.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            securedFields.setState({ data: { test: '123' }, isValid: true });
            expect(securedFields.data.paymentMethod.test).toBe('123');
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            expect(securedFields.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            securedFields.setState({ data: { test: '123' }, isValid: true });
            expect(securedFields.isValid).toBe(true);
        });
    });
});
