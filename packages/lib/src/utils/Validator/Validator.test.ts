import Validator from './Validator';

describe('Validator', () => {
    test('Fields are valid by default', () => {
        const validator = new Validator();

        // defaults validation for unknown fields
        expect(validator.validate('aNewField', '123').hasError()).toBe(false);
        expect(validator.validate('aNewField', '123', 'input').hasError()).toBe(false);
    });

    test('Set custom rules', () => {
        const validator = new Validator({
            aNewField: {
                validate: () => false,
                errorMessage: 'test',
                modes: ['blur']
            }
        });

        expect(validator.validate('aNewField', '123').hasError()).toBe(true);

        // defaults validation since it is not defined for input
        expect(validator.validate('aNewField', '123', 'input').hasError()).toBe(false);
    });

    test('Has default rules', () => {
        const validator = new Validator({});

        expect(validator.validate('aNewField', '123').hasError()).toBe(false);
        expect(validator.validate('aNewField', null).hasError()).toBe(false);
        expect(validator.validate('shopperEmail', 'test@test.com').hasError()).toBe(false);
    });
});
