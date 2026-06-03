import Validator from './Validator';
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
