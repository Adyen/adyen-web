import { getCardImageUrl } from '../utils';
import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_CARD_NUMBER,
    CVC_POLICY_REQUIRED,
    DATE_POLICY_REQUIRED,
    ENCRYPTED_EXPIRY_DATE,
    OPTIONAL,
    HIDDEN,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR
} from '../lib/constants';
import {
    CbObjOnError,
    CbObjOnFocus,
    CbObjOnBrand,
    CbObjOnAllValid,
    CbObjOnFieldValid,
    CbObjOnAutoComplete,
    CbObjOnConfigSuccess,
    CbObjOnLoad
} from '../lib/types';
import { existy } from '../lib/utilities/commonUtils';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';

/**
 * Emits the onLoad event
 * Here we can assume all securedFields iframes have fired their 'load' event
 */
function handleOnLoad(cbObj: CbObjOnLoad): void {
    // Clear 'loading' timeout
    clearTimeout(this.csfLoadFailTimeout);
    this.csfLoadFailTimeout = null;

    // Propagate onLoad event
    this.props.onLoad(cbObj);

    /**
     * Having seen that the securedFields iframes have loaded some kind of content (we don't know what, yet)
     * - setTimeout since we expect to get a successful configuration message "within a reasonable time"
     *
     * Now we catch clientKey & environment mismatch in core.ts - this timeout being called indicates that the securedFields have not all configured
     * - so we need to clear the loading spinner to see if the securedFields are reporting anything
     */
    this.csfConfigFailTimeout = setTimeout(() => {
        if (this.state.status !== 'ready') {
            // Hide the spinner
            this.setState({ status: 'csfConfigFailure' });
            // Report the error
            this.props.onError(new AdyenCheckoutError('ERROR', 'secured fields have failed to configure'));
        }
    }, this.csfConfigFailTimeoutMS);
}

/**
 * Emits the onConfigSuccess (ready) event
 * Here we can assume CSF is loaded, configured and ready to be used
 */
function handleOnConfigSuccess(cbObj: CbObjOnConfigSuccess): void {
    // Clear 'config' timeout
    clearTimeout(this.csfConfigFailTimeout);
    this.csfConfigFailTimeout = null;

    this.setState({ status: 'ready' }, () => {
        // Propagate onConfigSuccess event
        this.props.onConfigSuccess(cbObj);
    });
}

/**
 * Emits the onAllValid event
 */
function handleOnAllValid(status: CbObjOnAllValid): boolean {
    // Form cannot be valid whilst there is an unsupported card
    if (this.state.detectedUnsupportedBrands) {
        return false;
    }

    this.setState({ isSfpValid: status.allValid }, () => {
        // New - fixes maestro-with-error-on-optional-cvc-field bug
        this.props.onChange(this.state, { event: 'handleOnAllValid' });
        // Propagate onAllValid event
        this.props.onAllValid(status);
    });

    return true;
}

/**
 * Saves a field value from CSF in the CardInput state
 * Emits the onFieldValid event
 */
function handleOnFieldValid(fieldObj: CbObjOnFieldValid): boolean {
    // A card number field cannot be valid whilst there is an unsupported card
    if (this.state.detectedUnsupportedBrands && fieldObj.fieldType === ENCRYPTED_CARD_NUMBER) {
        return false;
    }

    const setValidFieldState = prevState => ({
        data: { ...prevState.data, [fieldObj.encryptedFieldName]: fieldObj.blob },
        valid: { ...prevState.valid, [fieldObj.encryptedFieldName]: fieldObj.valid },
        /**
         * For a field that has just received valid:true (field has just been completed & encrypted) - mark the error state for this field as false
         * For a field that has just received valid:false (field was encrypted, now is not)
         *  - field is either in a state of being incomplete but without errors (digit deleted) - so mark the error state for this field as false
         *  or has switched from valid/encrypted state to being in error (digit edited to one that puts the field in error) - so keep any error that
         *  might just have been set
         */
        errors: { ...prevState.errors, [fieldObj.fieldType]: prevState.errors[fieldObj.fieldType] ?? false }
    });

    this.setState(setValidFieldState, () => {
        this.props.onChange(this.state, { event: 'handleOnFieldValid', fieldType: fieldObj.fieldType });

        // Propagate onFieldValid event
        this.props.onFieldValid(fieldObj);
    });

    return true;
}

function fieldIsInError(fieldType: string, policy: string, numCharsObj: object, errorsObj) {
    return (policy === OPTIONAL || policy === HIDDEN) && numCharsObj[fieldType] === 0 ? false : errorsObj[fieldType];
}

/**
 * Saves the card brand in state
 * Emits the onBrand event
 */
function handleOnBrand(cardInfo: CbObjOnBrand): void {
    this.setState(
        prevState => {
            /**
             * If we change brand to one where the cvc or date field(s) are not required & are empty - then these fields cannot be in error
             * (scenario: have validated empty form, then choose brand w. optional/hidden cvc or date)...
             * ...else propagate the existing error.
             */
            const cvcFieldInError = fieldIsInError(ENCRYPTED_SECURITY_CODE, cardInfo.cvcPolicy, this.numCharsInField, prevState.errors);

            const dateFieldInError =
                this.numDateFields === 1
                    ? fieldIsInError(ENCRYPTED_EXPIRY_DATE, cardInfo.expiryDatePolicy, this.numCharsInField, prevState.errors)
                    : null;

            // For custom card comp
            const monthFieldInError =
                this.numDateFields === 2
                    ? fieldIsInError(ENCRYPTED_EXPIRY_MONTH, cardInfo.expiryDatePolicy, this.numCharsInField, prevState.errors)
                    : null;

            const yearFieldInError =
                this.numDateFields === 2
                    ? fieldIsInError(ENCRYPTED_EXPIRY_YEAR, cardInfo.expiryDatePolicy, this.numCharsInField, prevState.errors)
                    : null;
            // --
            /** end */

            return {
                brand: cardInfo.brand,
                cvcPolicy: cardInfo.cvcPolicy ?? CVC_POLICY_REQUIRED,
                showSocialSecurityNumber: cardInfo.showSocialSecurityNumber,
                errors: {
                    ...prevState.errors,
                    ...(existy(cvcFieldInError) && { [ENCRYPTED_SECURITY_CODE]: cvcFieldInError }),
                    ...(existy(dateFieldInError) && { [ENCRYPTED_EXPIRY_DATE]: dateFieldInError }),
                    ...(existy(monthFieldInError) && { [ENCRYPTED_EXPIRY_MONTH]: monthFieldInError }),
                    ...(existy(yearFieldInError) && { [ENCRYPTED_EXPIRY_YEAR]: yearFieldInError })
                },
                expiryDatePolicy: cardInfo.expiryDatePolicy ?? DATE_POLICY_REQUIRED
            };
        },
        () => {
            this.props.onChange(this.state, { event: 'handleOnBrand' });

            // Enhance data object with the url for the brand image, first checking if the merchant has configured their own one for this brand
            const brandImageUrl = this.props.brandsConfiguration[cardInfo.brand]?.icon ?? getCardImageUrl(cardInfo.brand, this.props.resources);
            this.props.onBrand({ ...cardInfo, brandImageUrl });
        }
    );
}

/**
 * Handles validation errors
 */
function handleOnError(cbObj: CbObjOnError, hasUnsupportedCard: boolean = null): boolean {
    const errorCode = cbObj.error;

    this.setState(
        prevState => ({
            errors: { ...prevState.errors, [cbObj.fieldType]: errorCode || false },
            // If dealing with an unsupported card ensure these card number related fields are reset re. pasting a full, unsupported card straight in
            ...(hasUnsupportedCard && { data: { ...prevState.data, [ENCRYPTED_CARD_NUMBER]: undefined } }),
            ...(hasUnsupportedCard && { valid: { ...prevState.valid, [ENCRYPTED_CARD_NUMBER]: false } }),
            ...(hasUnsupportedCard && { isSfpValid: false })
        }),
        () => {
            this.props.onChange(this.state, { event: 'handleOnError', fieldType: cbObj.fieldType });
        }
    );

    return true;
}

function handleFocus(cbObj: CbObjOnFocus): void {
    this.numCharsInField[cbObj.fieldType] = cbObj.numChars;

    this.props.onFocus(cbObj);
}

function handleOnTouchstartIOS(cbObj): void {
    // disableIOSArrowKeys is either null or a function (in which case we should call it)
    this.props.disableIOSArrowKeys?.(cbObj);
}

// Only called for holder name (from CSF>partials>processAutoComplete)
function handleOnAutoComplete(cbObj: CbObjOnAutoComplete): void {
    this.setState({ autoCompleteName: cbObj.value }, () => {
        this.props.onChange(this.state, { event: 'handleOnAutoComplete', fieldType: cbObj.fieldType });
        this.setState({ autoCompleteName: null }); // Nullify ref after sending it (lets shopper edit holder name)
    });
    this.props.onAutoComplete(cbObj);
}

/**
 * Handles cases where no secured fields are necessary (one click payments without CVC)
 * Automatically resolves with a valid state
 */
function handleOnNoDataRequired(): void {
    this.setState({ status: 'ready' }, () => this.props.onChange({ isSfpValid: true }));
}

export default {
    handleFocus,
    handleOnAllValid,
    handleOnAutoComplete,
    handleOnFieldValid,
    handleOnLoad,
    handleOnConfigSuccess,
    handleOnBrand,
    handleOnError,
    handleOnNoDataRequired,
    handleOnTouchstartIOS
};
