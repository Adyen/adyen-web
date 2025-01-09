import { ENCRYPTED_CARD_NUMBER, CREDIT_CARD_SF_FIELDS } from '../../../internal/SecuredFields/lib/constants';
import { selectOne } from '../../../internal/SecuredFields/lib/utilities/dom';
import { CardFocusData } from '../../../internal/SecuredFields/lib/types';

/**
 * Helper for CardInput - gets a field name and sets focus on it
 */
export const setFocusOnFirstField = (isValidating, sfp, fieldToFocus) => {
    if (isValidating) {
        // If not a cardInput related securedField - find field and set focus on it
        if (!CREDIT_CARD_SF_FIELDS.includes(fieldToFocus)) {
            setFocusOnNonSF(fieldToFocus, sfp);
        } else {
            // Is a securedField - so it has its own focus procedures
            sfp.current.setFocusOn(fieldToFocus);
        }
    }
};

export const getAddressHandler = (setFormData, setFormValid, setFormErrors) => {
    // Return Handler fn:
    return address => {
        setFormData('billingAddress', address.data);
        setFormValid('billingAddress', address.isValid);
        setFormErrors('billingAddress', address.errors);
    };
};

export const getFocusHandler = (setFocusedElement, onFocus, onBlur) => {
    // Return Handler fn:
    return (e: CardFocusData) => {
        setFocusedElement(e.currentFocusObject);
        e.focus === true ? onFocus(e.fieldType, e) : onBlur(e.fieldType, e);
    };
};

export const getAutoJumpHandler = (isAutoJumping, sfp, layout) => {
    return () => {
        if (!isAutoJumping.current) {
            isAutoJumping.current = true;

            // CardInput can call this more than once in quick succession
            // e.g. if field was in error (error + fieldValid) or other SFs are optional (fieldValid + allValid) etc
            // - so make async to avoid double setFocus call
            void Promise.resolve().then(() => {
                const panIndex = layout.findIndex(elem => elem === ENCRYPTED_CARD_NUMBER);
                const subsequentFields = layout.slice(panIndex + 1);

                /**
                 * Investigate subsequent fields to see if they can/should accept focus
                 */
                for (const field of subsequentFields) {
                    // Is the next field a credit card related securedField?
                    if (CREDIT_CARD_SF_FIELDS.includes(field)) {
                        const isOptionalOrHidden = sfp.current.sfIsOptionalOrHidden(field);
                        if (!isOptionalOrHidden) {
                            sfp.current.setFocusOn(field);
                            break;
                        }
                    } else {
                        // If it isn't an SF - shift focus to it (we're currently not concerned with whether the field is optional)

                        setFocusOnNonSF(field, sfp);
                        break;
                    }
                }

                isAutoJumping.current = false;
            });
        }
    };
};

const setFocusOnNonSF = (field, sfp) => {
    let nameVal: string = field;

    // We have an exception with the kcp taxNumber where the name of the field ('kcpTaxNumberOrDOB') doesn't match
    // the value by which the field is referred to internally ('taxNumber')
    if (nameVal === 'taxNumber') nameVal = 'kcpTaxNumberOrDOB';

    if (nameVal === 'country' || nameVal === 'stateOrProvince') {
        // Set focus on dropdown
        const field: HTMLElement = selectOne(sfp.current.rootNode, `.adyen-checkout__field--${nameVal} .adyen-checkout__filter-input`);
        field?.focus();
    } else {
        // Set focus on input
        const field: HTMLElement = selectOne(sfp.current.rootNode, `[name="${nameVal}"]`);
        field?.focus();
    }
};
