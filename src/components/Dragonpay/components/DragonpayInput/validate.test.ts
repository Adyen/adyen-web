import { isValidEmail } from './validate';

describe('validate Dragonpay Input', () => {
    describe('isValidEmail', () => {
        test('should return true if it has a valid email', () => {
            expect(isValidEmail('a@c.co')).toBe(true);
            expect(isValidEmail('abcdef')).toBe(false);
            expect(isValidEmail('tes2')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });
});
