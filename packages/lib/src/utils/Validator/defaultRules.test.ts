import { validationRules } from './defaultRules';
import { ERROR_FIELD_REQUIRED } from '../../core/Errors/constants';

describe('defaultRules', () => {
    test('should return null and set the required error for an empty phone number', () => {
        const { phoneNumberRule } = validationRules;

        expect(phoneNumberRule.validate('', undefined)).toBeNull();
        expect(phoneNumberRule.errorMessage).toBe(ERROR_FIELD_REQUIRED);
    });

    test('should return null and set the required error for an empty email', () => {
        const { emailRule } = validationRules;

        expect(emailRule.validate('', undefined)).toBeNull();
        expect(emailRule.errorMessage).toBe(ERROR_FIELD_REQUIRED);
    });
});
