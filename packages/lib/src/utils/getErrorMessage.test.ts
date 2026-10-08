import { getErrorMessage } from './getErrorMessage';
import { ERROR_FIELD_INVALID, ERROR_FIELD_REQUIRED } from '../core/Errors/constants';
import { ValidationRuleResult } from './Validator/ValidationRuleResult';
import { setupCoreMock } from '../../config/testMocks/setup-core-mock';

const { i18n } = setupCoreMock().modules;

const createError = (errorMessage: string): ValidationRuleResult => ({ isValid: false, errorMessage }) as unknown as ValidationRuleResult;

describe('getErrorMessage', () => {
    test('should return false if there is no error', () => {
        expect(getErrorMessage(i18n, undefined, 'First name')).toBe(false);
    });

    test('should return false if the error is null', () => {
        expect(getErrorMessage(i18n, null, 'First name')).toBe(false);
    });

    test('should return true if there is an error without a usable message', () => {
        expect(getErrorMessage(i18n, createError(''), 'First name')).toBe(true);
    });

    test('should build the message from the lower cased label for the required error', () => {
        const expected = i18n.get(ERROR_FIELD_REQUIRED, { values: { label: 'first name' } });

        expect(getErrorMessage(i18n, createError(ERROR_FIELD_REQUIRED), 'First name')).toBe(expected);
    });

    test('should build the message from the label as provided if lowerCaseLabel is false', () => {
        const expected = i18n.get(ERROR_FIELD_INVALID, { values: { label: 'First name' } });

        expect(getErrorMessage(i18n, createError(ERROR_FIELD_INVALID), 'First name', false)).toBe(expected);
    });

    test('should translate the error message directly for any other key', () => {
        expect(getErrorMessage(i18n, createError('companyDetails.name.invalid'), 'Company name')).toBe('Enter the company name');
    });
});
