import { isValidIBAN, isValidHolder, checkIbanStatus } from './validate';

const VALID_IBAN = 'NL13TEST0123456789';
const INVALID_IBAN = 'NL13TEST0123456788';

describe('IBAN Validations', () => {
    describe('isValidIBAN', () => {
        test('Validates a correct IBAN', () => {
            expect(isValidIBAN(VALID_IBAN)).toBe(true);
        });

        test('returns false for an incorrect IBAN', () => {
            expect(isValidIBAN(INVALID_IBAN)).toBe(false);
        });

        test('should return false for an unknown country code digit', () => {
            expect(isValidIBAN('ZZ68539007547034')).toBe(false);
        });

        test('should return true for a valid belgian IBAN', () => {
            expect(isValidIBAN('BE68539007547034')).toBe(true);
        });

        test('should return true for a valid Dutch IBAN', () => {
            expect(isValidIBAN('NL86INGB0002445588')).toBe(true);
        });

        test('should return true for a valid Saint-Lucia IBAN', () => {
            expect(isValidIBAN('LC55HEMM000100010012001200023015')).toBe(true);
        });

        test('should return false for an incorrect check digit', () => {
            expect(isValidIBAN('BE68539007547035')).toBe(false);
        });
    });

    describe('isValidHolder', () => {
        test('Validates a correct account Holder name', () => {
            expect(isValidHolder('John Doe')).toBe(true);
        });

        test('Returns null for an empty account Holder Name', () => {
            expect(isValidHolder('')).toBe(null);
        });

        test('Returns null for an undefined account Holder Name', () => {
            expect(isValidHolder(undefined)).toBe(null);
        });

        test('Returns true for an defined account Holder Name', () => {
            expect(isValidHolder(123)).toBe(true);
        });
    });

    describe('checkIbanStatus', () => {
        test('TOO_SHORT', () => {
            const validationStatus = checkIbanStatus('N');
            expect(validationStatus.status).toBe('no-validate');
            expect(validationStatus.code).toBe('TOO_SHORT');
        });

        test('INVALID_COUNTRY', () => {
            const validationStatus = checkIbanStatus('NX13 TEST 1123 4567 89');
            expect(validationStatus.status).toBe('invalid');
            expect(validationStatus.code).toBe('INVALID_COUNTRY');

            const validationStatus2 = checkIbanStatus('AA');
            expect(validationStatus2.status).toBe('invalid');
            expect(validationStatus2.code).toBe('INVALID_COUNTRY');

            const validationStatus3 = checkIbanStatus('1344929393389423893893289');
            expect(validationStatus3.status).toBe('invalid');
            expect(validationStatus3.code).toBe('INVALID_COUNTRY');
        });

        test('INVALID_IBAN', () => {
            const validationStatus = checkIbanStatus('NL13 TEST 1123 4567 89');
            expect(validationStatus.status).toBe('invalid');
            expect(validationStatus.code).toBe('INVALID_IBAN');
        });

        test('VALID', () => {
            const validationStatus = checkIbanStatus('NL13 TEST 0123 4567 89');
            expect(validationStatus.status).toBe('valid');
            expect(validationStatus.code).toBe('VALID');

            const validationStatusDE = checkIbanStatus('DE14123456780023456789');
            expect(validationStatusDE.status).toBe('valid');
            expect(validationStatusDE.code).toBe('VALID');

            const validationStatusES = checkIbanStatus('ES9121000418450200051332');
            expect(validationStatusES.status).toBe('valid');
            expect(validationStatusES.code).toBe('VALID');

            const validationStatusBE = checkIbanStatus('BE15539000000030');
            expect(validationStatusBE.status).toBe('valid');
            expect(validationStatusBE.code).toBe('VALID');
        });

        test('TOO_LONG', () => {
            const validationStatus = checkIbanStatus('NL13 TEST 0123 4567 891');
            expect(validationStatus.status).toBe('invalid');
            expect(validationStatus.code).toBe('TOO_LONG');

            const validationStatusBE = checkIbanStatus('BE155390000000301');
            expect(validationStatusBE.status).toBe('invalid');
            expect(validationStatusBE.code).toBe('TOO_LONG');
        });
    });
});
