import Validator from './Validator';

describe('Validator', () => {
    test('Validates fields with a default validation rule', () => {
        const validator = new Validator();

        // defaults validation for unknown fields
        expect(validator.validate('aNewField')('123')).toBe(true);
        expect(validator.validate('aNewField', 'input')('123')).toBe(true);
    });

    test('Set custom rules', () => {
        const validator = new Validator({
            blur: {
                aNewField: () => false
            }
        });

        expect(validator.validate('aNewField')('123')).toBe(false);

        // defaults validation since it is not defined for input
        expect(validator.validate('aNewField', 'input')('123')).toBe(true);
    });

    test('Has default rules', () => {
        const validator = new Validator({});

        expect(validator.validate('shopperEmail')('123')).toBe(false);
        expect(validator.validate('shopperEmail')(null)).toBe(false);
        expect(validator.validate('shopperEmail')('test@test.com')).toBe(true);
    });
});
