import Validator from './Validator';
import { validationRules } from './defaultRules';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import enUS from '../../../../server/translations/en-US.json';

const mockRules = {};
const translatedErrorMsg = enUS['field.invalid'];

describe('Validator', () => {
    const core = setupCoreMock();
    const { i18n } = core.modules;

    test('Fields are valid by default', () => {
        const validator = new Validator(mockRules, i18n);

        // defaults validation for unknown fields
        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(false);
        expect(validator.validate({ key: 'aNewField', value: '123', mode: 'input' }).hasError()).toBe(false);
    });

    test('Set custom rules', () => {
        const validator = new Validator(
            {
                aNewField: {
                    validate: () => false,
                    errorMessage: 'test',
                    modes: ['blur']
                }
            },
            i18n
        );

        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(true);

        // defaults validation since it is not defined for input
        expect(validator.validate({ key: 'aNewField', value: '123', mode: 'input' }).hasError()).toBe(false);
    });

    test('Has default rules', () => {
        const validator = new Validator({}, i18n);

        expect(validator.validate({ key: 'aNewField', value: '123' }).hasError()).toBe(false);
        expect(validator.validate({ key: 'aNewField', value: null }).hasError()).toBe(false);
        expect(validator.validate({ key: 'shopperEmail', value: 'test@test.com' }).hasError()).toBe(false);
    });

    test('should not report an empty email as an error unless the form is validated', () => {
        const validator = new Validator({ shopperEmail: validationRules.emailRule }, i18n);

        const result = validator.validate({ key: 'shopperEmail', value: '' });

        expect(result.hasError()).toBe(false);
        expect(result.hasError(true)).toBe(true);
        expect(result.isValid).toBeNull();
    });

    describe('isValid', () => {
        const validateWith = (...outcomes: Array<boolean | null>) => {
            const rules = outcomes.map(outcome => ({ validate: () => outcome, modes: ['blur' as const] }));
            return new Validator({ aField: rules }, i18n).validate({ key: 'aField', value: 'x' }).isValid;
        };

        test('should return false when any rule fails, regardless of rule order', () => {
            expect(validateWith(null, false)).toBe(false);
            expect(validateWith(false, null)).toBe(false);
            expect(validateWith(true, null, false)).toBe(false);
        });

        test('should return null when no rule fails and at least one rule is not validated', () => {
            expect(validateWith(true, null)).toBeNull();
            expect(validateWith(null, true)).toBeNull();
        });

        test('should return true when every rule passes', () => {
            expect(validateWith(true, true)).toBe(true);
        });
    });

    describe('errorI18n', () => {
        test('should set errorI18n from string errorMessage', () => {
            const validator = new Validator(
                {
                    testField: {
                        validate: () => false,
                        errorMessage: 'field.invalid',
                        modes: ['blur']
                    }
                },
                i18n
            );

            const result = validator.validate({ key: 'testField', value: 'invalid' });
            const error = result.getError();

            expect(error?.errorMessage).toBe('field.invalid');
            expect(error?.errorI18n).toBe(translatedErrorMsg);
        });

        test('should set errorI18n from ErrorMessageObject with translationKey and translationObject', () => {
            const errorMessageObject = {
                translationKey: 'field.invalid',
                translationObject: { values: { fieldName: 'Test Field' } }
            };

            const validator = new Validator(
                {
                    testField: {
                        validate: () => false,
                        errorMessage: errorMessageObject,
                        modes: ['blur']
                    }
                },
                i18n
            );

            const result = validator.validate({ key: 'testField', value: 'invalid' });
            const error = result.getError();

            expect(error?.errorMessage).toEqual(errorMessageObject);
            expect(error?.errorI18n).toBe(translatedErrorMsg);
        });

        test('should leave errorI18n undefined when errorMessage is undefined', () => {
            const validator = new Validator(
                {
                    testField: {
                        validate: () => false,
                        modes: ['blur']
                    }
                },
                i18n
            );

            const result = validator.validate({ key: 'testField', value: 'invalid' });
            const error = result.getError();

            expect(error?.errorMessage).toBeUndefined();
            expect(error?.errorI18n).toBeUndefined();
        });
    });
});
