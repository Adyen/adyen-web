import { ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import { ALL_SECURED_FIELDS, ENCRYPTED_EXPIRY_DATE } from '../../../internal/SecuredFields/lib/configuration/constants';
import { selectOne } from '../../../internal/SecuredFields/lib/utilities/dom';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';

//
/**
 * Return a function that can act as a callback for the ErrorPanel
 */
export const getErrorPanelHandler = (isValidating, sfp, handleFocus: (e: CbObjOnFocus) => void) => {
    // Return Handler fn:
    return (errors: ErrorPanelObj): void => {
        if (isValidating.current) {
            const who: string = errors.fieldList[0];

            // If not a securedField - find field and set focus on it
            if (!ALL_SECURED_FIELDS.includes(who)) {
                let nameVal: string = who;

                // We have an exception with the kcp taxNumber where the name of the field ('kcpTaxNumberOrDOB') doesn't match
                // the value by which the field is referred to internally ('taxNumber')
                if (nameVal === 'taxNumber') nameVal = 'kcpTaxNumberOrDOB';

                if (nameVal === 'country' || nameVal === 'stateOrProvince') {
                    // Set focus on dropdown
                    const field: HTMLElement = selectOne(
                        sfp.current.rootNode,
                        `.adyen-checkout__field--${nameVal} .adyen-checkout__dropdown__button`
                    );
                    field?.focus();
                } else {
                    // Set focus on input
                    const field: HTMLElement = selectOne(sfp.current.rootNode, `[name="${nameVal}"]`);
                    field?.focus();
                }
            } else {
                // Is a securedField - so it has it's own focus procedures
                handleFocus({ currentFocusObject: who } as CbObjOnFocus);
                sfp.current.setFocusOn(who);
            }
            isValidating.current = false;
        }
    };
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
    return (e: CbObjOnFocus) => {
        setFocusedElement(e.currentFocusObject);
        e.focus === true ? onFocus(e) : onBlur(e);
    };
};

export const getAutoJumpHandler = (isAutoJumping, sfp, layout) => {
    return () => {
        if (!isAutoJumping.current) {
            isAutoJumping.current = true;
            console.log('### handlers::doPANAutoJump:: set focus on next field layout=', layout);

            // CardInput can call this more than once in quick succession
            // e.g. if field was in error (error + fieldValid) or other SFs are optional (fieldValid + allValid) etc
            // - so make async to avoid double setFocus call
            Promise.resolve().then(() => {
                sfp.current.setFocusOn(ENCRYPTED_EXPIRY_DATE);
                isAutoJumping.current = false;
            });
        }
    };
};
