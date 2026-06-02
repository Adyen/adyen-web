import Validator from '../../../utils/Validator';
import { payIdValidationRules } from './validate';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

describe('Test payIdValidationRules', () => {
    const core = setupCoreMock();
    const { i18n } = core.modules;
    const validator = new Validator(payIdValidationRules, i18n);

    // Email tests
    test('Test success email', () => {
        expect(validator.validate({ key: 'email', value: 'example@example.com' }).hasError()).toBe(false);
    });

    test('Test sucesss email (empty)', () => {
        // Empty validation only should occur on useForm level and not on the field
        expect(validator.validate({ key: 'email', value: '' }).hasError()).toBe(false);
    });

    test('Test failure email (invalid format)', () => {
        expect(validator.validate({ key: 'email', value: 'invalid-email' }).hasError()).toBe(true);
    });

    test('Test failure email (missing domain)', () => {
        expect(validator.validate({ key: 'email', value: 'user@.com' }).hasError()).toBe(true);
    });

    // ABN tests
    test('Test success abn (9 digits)', () => {
        expect(validator.validate({ key: 'abn', value: '123456789' }).hasError()).toBe(false);
    });

    test('Test success abn (11 digits)', () => {
        expect(validator.validate({ key: 'abn', value: '12345678901' }).hasError()).toBe(false);
    });

    test('Test failure abn (empty)', () => {
        // Empty validation only should occur on useForm level and not on the field
        expect(validator.validate({ key: 'abn', value: '' }).hasError()).toBe(false);
    });

    test('Test failure abn (non-numeric characters)', () => {
        expect(validator.validate({ key: 'abn', value: '123abc789' }).hasError()).toBe(true);
    });

    test('Test failure abn (too short)', () => {
        expect(validator.validate({ key: 'abn', value: '12345678' }).hasError()).toBe(true);
    });

    test('Test failure abn (too long)', () => {
        expect(validator.validate({ key: 'abn', value: '123456789012' }).hasError()).toBe(true);
    });

    test('Test failure orgid (empty)', () => {
        // Empty validation only should occur on useForm level and not on the field
        expect(validator.validate({ key: 'orgid', value: '' }).hasError()).toBe(false);
    });

    test('Test failure orgid (too long)', () => {
        const longOrgID = 'A'.repeat(256); // 256 characters
        expect(validator.validate({ key: 'orgid', value: longOrgID }).hasError()).toBe(true);
    });

    test('Test failure orgid (invalid characters)', () => {
        expect(validator.validate({ key: 'orgid', value: 'InvalidOrgID<>?' }).hasError()).toBe(true);
    });
});
