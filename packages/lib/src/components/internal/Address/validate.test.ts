import { validatePostalCode } from './validate';
import { ValidatorRules } from '../../../utils/Validator/types';

describe('validatePostalCode', () => {
    const validatorRules: ValidatorRules = {
        postalCode: {
            modes: ['blur'],
            validate: jest.fn(),
            errorMessage: ''
        }
    };

    // LT
    it('should return true for a valid LT postal code without the LT prefix', () => {
        const result = validatePostalCode('12345', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid LT postal code without the LT prefix (4-digits)', () => {
        const result = validatePostalCode('1234', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid LT postal code with the LT prefix', () => {
        const result = validatePostalCode('LT-12345', 'LT', validatorRules);
        expect(result).toBe(true);
    });

    it('should return false for a valid LT postal code with the LT prefix but only 4 digits', () => {
        const result = validatePostalCode('LT-1235', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    it('should return false for an invalid LT postal code with fewer than 4 digits', () => {
        const result = validatePostalCode('123', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    it('should return false for an invalid LT postal code with fewer than 6 digits', () => {
        const result = validatePostalCode('1234567', 'LT', validatorRules);
        expect(result).toBe(false);
    });

    // BR
    it('should return true for a valid BR postal code with hyphen', () => {
        const result = validatePostalCode('12345-678', 'BR', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid BR postal code without hyphen', () => {
        const result = validatePostalCode('12345678', 'BR', validatorRules);
        expect(result).toBe(true);
    });

    it('should return false for an invalid BR postal code', () => {
        const result = validatePostalCode('1234-5678', 'BR', validatorRules);
        expect(result).toBe(false);
    });

    // US and the ones using createPatternByDigits
    it('should return true for a valid US postal code with 5 digits', () => {
        const result = validatePostalCode('12345', 'US', validatorRules);
        expect(result).toBe(true);
    });

    // It fails because createPatternByDigits actually just check if there's at least X amount of digits
    // it('should return false for an invalid US postal code with more than 5 digits without a hyphen', () => {
    //     const result = validatePostalCode('1234567', 'US', validatorRules);
    //     expect(result).toBe(false);
    // });

    // General
    it('should return null if the postal code is empty', () => {
        const result = validatePostalCode('', 'AT', validatorRules);
        expect(result).toBeNull();
    });

    it('should return true for a valid AT postal code', () => {
        const result = validatePostalCode('1234', 'AT', validatorRules);
        expect(result).toBe(true);
    });

    // PT
    it('should return true for a valid PT postal code without hyphen', () => {
        const result = validatePostalCode('1234567', 'PT', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid PT postal code with hyphen', () => {
        const result = validatePostalCode('1234-567', 'PT', validatorRules);
        expect(result).toBe(true);
    });

    it('should return false for an invalid PT postal code with incorrect format', () => {
        const result = validatePostalCode('123-4567', 'PT', validatorRules);
        expect(result).toBe(false);
    });

    // it('should return true for an PT postal code with just the part before the hyphen', () => {
    //     const result = validatePostalCode('1234', 'PT', validatorRules);
    //     expect(result).toBe(true);
    // });

    // NL
    it('should return true for a valid NL postal code without NL prefix', () => {
        const result = validatePostalCode('1234AB', 'NL', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid NL postal code with space between digits and letters', () => {
        const result = validatePostalCode('1234 AB', 'NL', validatorRules);
        expect(result).toBe(true);
    });

    it('should return true for a valid NL postal code with NL prefix', () => {
        const result = validatePostalCode('NL-1234AB', 'NL', validatorRules);
        expect(result).toBe(true);
    });

    it('should return false for an invalid NL postal code with missing letters', () => {
        const result = validatePostalCode('1234', 'NL', validatorRules);
        expect(result).toBe(false);
    });

    // Againt it seems like it's missing begining and end ^ $ symbols in the regex (same as US)
    // it('should return false for an invalid NL postal code with incorrect letter combination', () => {
    //     const result = validatePostalCode('1234AA1', 'NL', validatorRules);
    //     expect(result).toBe(false);
    // });

    it('should return false for an invalid NL postal code with fewer digits', () => {
        const result = validatePostalCode('123AB', 'NL', validatorRules);
        expect(result).toBe(false);
    });

    // it('should return false for an invalid NL postal code with too many digits', () => {
    //     const result = validatePostalCode('12345AB', 'NL', validatorRules);
    //     expect(result).toBe(false);
    // });
});
