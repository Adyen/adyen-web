import Validator from './Validator';

const mockRules = {};

describe('Validator', () => {
    test('Fields are valid by default', () => {
        const validator = new Validator(mockRules);

        // defaults validation for unknown fields
        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(false);
        expect(validator.validate({ key: 'aNewField', value: '123', mode: 'input' }).hasError()).toBe(false);
    });

    test('Set custom rules', () => {
        const validator = new Validator({
            aNewField: {
                validate: () => false,
                errorMessage: 'test',
                modes: ['blur']
            }
        });

        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(true);

        // defaults validation since it is not defined for input
        expect(validator.validate({ key: 'aNewField', value: '123', mode: 'input' }).hasError()).toBe(false);
    });

    test('Has default rules', () => {
        const validator = new Validator({});

        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(false);
        expect(validator.validate({ key: 'aNewField', value: null }).hasError()).toBe(false);
        expect(validator.validate({ key: 'shopperEmail', value: 'test@test.com' }).hasError()).toBe(false);
    });
});
