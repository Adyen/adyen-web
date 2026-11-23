import { validatePostalCode } from './validate';
import { ValidatorRules, ValidatorRule } from '../../../utils/Validator/types';
import { ERROR_INVALID_FORMAT_EXPECTS } from '../../../core/Errors/constants';

describe('validatePostalCode', () => {
    const validatorRules: ValidatorRules = {
        postalCode: {
            modes: ['blur'],
            validate: jest.fn(),
            errorMessage: ''
        }
    };

    // LT
    test('should return true for a valid LT postal code without the LT prefix', () => {
        const result = validatePostalCode('12345', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    test('should return true for a valid LT postal code without the LT prefix (4-digits)', () => {
        const result = validatePostalCode('1234', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    test('should return true for a valid LT postal code with the LT prefix', () => {
        const result = validatePostalCode('LT-12345', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for a valid LT postal code with the LT prefix but only 4 digits', () => {
        const result = validatePostalCode('LT-1235', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    test('should return false for an invalid LT postal code with fewer than 4 digits', () => {
        const result = validatePostalCode('123', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    test('should return false for an invalid LT postal code with fewer than 6 digits', () => {
        const result = validatePostalCode('1234567', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    // BR
    test('should return true for a valid BR postal code with hyphen', () => {
        const result = validatePostalCode('12345-678', 'BR', validatorRules);
        expect(result).toBe(true);
    });

    test('should return true for a valid BR postal code without hyphen', () => {
        const result = validatePostalCode('12345678', 'BR', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for an invalid BR postal code', () => {
        const result = validatePostalCode('1234-5678', 'BR', validatorRules);
        expect(result).toBe(false);
    });

    // US and the ones using createPatternByDigits
    test('should return true for a valid US postal code with 5 digits', () => {
        const result = validatePostalCode('12345', 'US', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for an invalid US postal code with more than 5 digits without a hyphen', () => {
        const result = validatePostalCode('1234567', 'US', validatorRules);
        expect(result).toBe(false);
    });

    test('should return true for a valid 9-digit US postal code with a hyphen', () => {
        const result = validatePostalCode('12345-6789', 'US', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for an invalid 9-digit US postal code', () => {
        const result = validatePostalCode('12345-678', 'US', validatorRules);
        expect(result).toBe(false);
    });

    // General
    test('should return null if the postal code is empty', () => {
        const result = validatePostalCode('', 'AT', validatorRules);
        expect(result).toBeNull();
    });

    test('should return true for a valid AT postal code', () => {
        const result = validatePostalCode('1234', 'AT', validatorRules);
        expect(result).toBe(true);
    });

    // JP
    test('should return true for a valid JP postal code with hyphen', () => {
        const result = validatePostalCode('123-4567', 'JP', validatorRules);
        expect(result).toBe(true);
    });

    test('should return true for a valid JP postal code without hyphen', () => {
        const result = validatePostalCode('1234567', 'JP', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for an invalid JP postal code', () => {
        const result = validatePostalCode('12-34567', 'JP', validatorRules);
        expect(result).toBe(false);
    });

    // PT
    test('should return true for a valid PT postal code without hyphen', () => {
        const result = validatePostalCode('1234567', 'PT', validatorRules);
        expect(result).toBe(true);
    });

    test('should return true for a valid PT postal code with hyphen', () => {
        const result = validatePostalCode('1234-567', 'PT', validatorRules);
        expect(result).toBe(true);
    });

    test('should return false for an invalid PT postal code with incorrect format', () => {
        const result = validatePostalCode('123-4567', 'PT', validatorRules);
        expect(result).toBe(false);
    });

    test('should accept a PT postal code with a trailing hyphen', () => {
        expect(validatePostalCode('1234-', 'PT', validatorRules)).toBe(true);
        expect(validatePostalCode('1234-56', 'PT', validatorRules)).toBe(false);
    });

    // test('should return true for an PT postal code with just the part before the hyphen', () => {
    //     const result = validatePostalCode('1234', 'PT', validatorRules);
    //     expect(result).toBe(true);
    // });

    // NL
    test('should validate NL postal codes', () => {
        expect(validatePostalCode('1234AB', 'NL', validatorRules)).toBe(true);
        expect(validatePostalCode('1234 AB', 'NL', validatorRules)).toBe(true);
        expect(validatePostalCode('NL-1234AB', 'NL', validatorRules)).toBe(true);
        expect(validatePostalCode('1234', 'NL', validatorRules)).toBe(false);
        expect(validatePostalCode('123AB', 'NL', validatorRules)).toBe(false);
    });

    // LV
    test('should return true for a valid LV postal code', () => {
        expect(validatePostalCode('1050', 'LV', validatorRules)).toBe(true);
        expect(validatePostalCode('LV-1050', 'LV', validatorRules)).toBe(true);
    });

    test('should return false for an invalid LV postal code', () => {
        expect(validatePostalCode('105', 'LV', validatorRules)).toBe(false);
        expect(validatePostalCode('LT-1050', 'LV', validatorRules)).toBe(false);
    });

    // MT
    test('should return true for a valid MT postal code', () => {
        expect(validatePostalCode('VL11', 'MT', validatorRules)).toBe(true);
        expect(validatePostalCode('VLT 11', 'MT', validatorRules)).toBe(true);
        expect(validatePostalCode('VLT 1117', 'MT', validatorRules)).toBe(true);
    });

    test('should return false for an invalid MT postal code', () => {
        expect(validatePostalCode('V1117', 'MT', validatorRules)).toBe(false);
        expect(validatePostalCode('VLT111', 'MT', validatorRules)).toBe(false);
        expect(validatePostalCode('VL1111', 'MT', validatorRules)).toBe(false);
    });

    // SK
    test('should return true for a valid SK postal code', () => {
        expect(validatePostalCode('01001', 'SK', validatorRules)).toBe(true);
        expect(validatePostalCode('010 01', 'SK', validatorRules)).toBe(true);
        expect(validatePostalCode('SK-01001', 'SK', validatorRules)).toBe(true);
        expect(validatePostalCode('SK-811 01', 'SK', validatorRules)).toBe(true);
    });

    test('should return false for an invalid SK postal code', () => {
        expect(validatePostalCode('0100', 'SK', validatorRules)).toBe(false);
        expect(validatePostalCode('01 001', 'SK', validatorRules)).toBe(false);
        expect(validatePostalCode('123456', 'SK', validatorRules)).toBe(false);
    });

    // DK
    test('should validate DK postal codes', () => {
        expect(validatePostalCode('1234', 'DK', validatorRules)).toBe(true);
        expect(validatePostalCode('DK-1234', 'DK', validatorRules)).toBe(true);
        expect(validatePostalCode('123', 'DK', validatorRules)).toBe(false);
    });

    // SI
    test('should validate SI postal codes', () => {
        expect(validatePostalCode('1234', 'SI', validatorRules)).toBe(true);
        expect(validatePostalCode('SI-1234', 'SI', validatorRules)).toBe(true);
        expect(validatePostalCode('123', 'SI', validatorRules)).toBe(false);
    });

    // CZ
    test('should validate CZ postal codes', () => {
        expect(validatePostalCode('123 45', 'CZ', validatorRules)).toBe(true);
        expect(validatePostalCode('12345', 'CZ', validatorRules)).toBe(true);
        expect(validatePostalCode('1234', 'CZ', validatorRules)).toBe(false);
    });

    // CA
    test('should validate CA postal codes', () => {
        expect(validatePostalCode('K1A 0T6', 'CA', validatorRules)).toBe(true);
        expect(validatePostalCode('K1A0T6', 'CA', validatorRules)).toBe(true);
        expect(validatePostalCode('K1A0T', 'CA', validatorRules)).toBe(false);
    });

    // IE
    test('should validate IE postal codes', () => {
        expect(validatePostalCode('D02 AF30', 'IE', validatorRules)).toBe(true);
        expect(validatePostalCode('D02AF30', 'IE', validatorRules)).toBe(true);
    });

    // ES
    test('should validate ES postal codes', () => {
        expect(validatePostalCode('28006', 'ES', validatorRules)).toBe(true);
    });

    // NZ
    test('should validate NZ postal codes', () => {
        expect(validatePostalCode('8041', 'NZ', validatorRules)).toBe(true);
        expect(validatePostalCode('123', 'NZ', validatorRules)).toBe(false);
    });

    // GE
    test('should validate GE postal codes', () => {
        expect(validatePostalCode('0100', 'GE', validatorRules)).toBe(true);
        expect(validatePostalCode('010', 'GE', validatorRules)).toBe(false);
        expect((validatorRules.postalCode as ValidatorRule).errorMessage).toEqual({
            translationKey: ERROR_INVALID_FORMAT_EXPECTS,
            translationObject: { values: { format: '9999' } }
        });
    });
});
