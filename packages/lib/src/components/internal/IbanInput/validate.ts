import { iso13616Prepare, iso7064Mod97_10, electronicFormat, regex, getIbanCountrySpecification, getCountryCode } from './utils';
import { isEmpty } from '../../../utils/validator-utils';

/**
 * Contains a validation status
 * @internal
 * @param status -
 * @param code -
 */
function ValidationStatus(status, code = null) {
    this.status = status;
    this.code = code;
}

/**
 * Validates the format of an iban
 * @internal
 * @param iban -
 */
const checkIbanStructure = iban => {
    const countryCode = iban.slice(0, 2);
    const ibanRegex = regex(iban, countryCode);

    return ((ibanRegex as RegExp).test && (ibanRegex as RegExp).test(iban.slice(4))) || false;
};

/**
 * Checks validity of an IBAN
 * @param iban -
 */
export const isValidIBAN = iban => {
    const electronicFormatIban = electronicFormat(iban);
    const preparedIban = iso13616Prepare(electronicFormatIban);
    const isValidISO = iso7064Mod97_10(preparedIban) === 1;

    return isValidISO && checkIbanStructure(electronicFormatIban);
};

/**
 * Checkss the validity status of an IBAN
 * @param iban -
 */
export const checkIbanStatus = iban => {
    const electronicFormatIban = electronicFormat(iban);

    if (iban.length < 2) {
        return new ValidationStatus('no-validate', 'TOO_SHORT'); // A
    }

    const countryCode = getCountryCode(electronicFormatIban);
    const countrySpecification = getIbanCountrySpecification(countryCode);

    if (!countrySpecification) {
        return new ValidationStatus('invalid', 'INVALID_COUNTRY'); // AA13TEST0123456789
    }

    if (electronicFormatIban.length > countrySpecification.length) {
        return new ValidationStatus('invalid', 'TOO_LONG'); // NL13TEST01234567891
    }

    if (electronicFormatIban.length === countrySpecification.length) {
        if (isValidIBAN(iban)) {
            return new ValidationStatus('valid', 'VALID'); // NL13TEST0123456789
        }

        return new ValidationStatus('invalid', 'INVALID_IBAN'); // NL13TEST0123456781
    }

    return new ValidationStatus('no-validate', 'UNKNOWN'); // NL13TEST012345678
};

/**
 * Checks validity of a holder name
 */
export const isValidHolder = value => (isEmpty(value) ? null : true); // true, if there are chars other than spaces
