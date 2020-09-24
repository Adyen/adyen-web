import { getCardImageUrl } from './utils';
import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_CARD_NUMBER } from './lib/configuration/constants';
import { getError, getVerifiedErrorCode } from '../../../core/Errors/utils';
import { ERROR_MSG_CLEARED } from '../../../core/Errors/constants';
import {
    CbObjOnError,
    CbObjOnFocus,
    CbObjOnBrand,
    CbObjOnAllValid,
    CbObjOnFieldValid,
    CbObjOnAutoComplete,
    CbObjOnConfigSuccess,
    CbObjOnLoad
} from './lib/types';

/**
 * Emits the onConfigSuccess (ready) event
 * Here we can assume CSF is loaded and ready to be used
 */
function handleOnLoad(cbObj: CbObjOnLoad): void {
    // Propagate onLoad event
    this.props.onLoad(cbObj);

    // eslint-disable-next-line
    this.originKeyErrorTimeout = setTimeout(() => {
        if (this.state.status !== 'ready') {
            // Hide the spinner and lets look at the inputs
            this.setState({ status: 'originKeyError' });
            this.props.onError({ error: 'originKeyError', fieldType: 'defaultError' });
        }
    }, this.originKeyTimeoutMS);
}

/**
 * Emits the onConfigSuccess (ready) event
 * Here we can assume CSF is loaded, configured and ready to be used
 */
function handleOnConfigSuccess(cbObj: CbObjOnConfigSuccess): void {
    clearTimeout(this.originKeyErrorTimeout);

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
    if (this.state.hasUnsupportedCard) {
        return false;
    }

    this.setState({ isSfpValid: status.allValid }, () => {
        this.props.onAllValid(status); // Propagate onAllValid event
    });

    return true;
}

/**
 * Saves a field value from CSF in the CardInput state
 * Emits the onFieldValid event
 */
function handleOnFieldValid(field: CbObjOnFieldValid): boolean {
    // A card number field cannot be valid whilst there is an unsupported card
    if (this.state.hasUnsupportedCard && field.fieldType === ENCRYPTED_CARD_NUMBER) {
        return false;
    }

    const setValidFieldState = prevState => ({
        data: { ...prevState.data, [field.encryptedFieldName]: field.blob },
        valid: { ...prevState.valid, [field.encryptedFieldName]: field.valid },
        // if a securedField comes through as valid:false it means the field has not been completed BUT is without errors - so set it as so (unless it was already in an error state)
        errors: { ...prevState.errors, [field.fieldType]: prevState.errors[field.fieldType] === true }
    });

    this.setState(setValidFieldState, () => {
        this.props.onChange(this.state);

        // Propagate onFieldValid event
        this.props.onFieldValid(field);
    });

    return true;
}

/**
 * Saves the card brand in state
 * Emits the onBrand event
 */
function handleOnBrand(cardInfo: CbObjOnBrand): void {
    this.setState(
        prevState => ({
            brand: cardInfo.brand,
            cvcRequired: cardInfo.cvcRequired !== false,
            errors: {
                ...prevState.errors,
                // Maintain error in CVC field unless switching brand to card where cvc field is not required & cvc field is empty
                [ENCRYPTED_SECURITY_CODE]: !cardInfo.cvcRequired && this.numCharsInCVC === 0 ? false : prevState.errors[ENCRYPTED_SECURITY_CODE]
            }
        }),
        () => {
            this.props.onChange(this.state);

            // Enhance data object with the url for the brand image
            this.props.onBrand({ ...cardInfo, brandImageUrl: getCardImageUrl(cardInfo.brand, this.props.loadingContext) });
        }
    );

    if ((this.props.hideCVC || !!cardInfo.hideCVC || cardInfo.cvcRequired === false) && this.props.oneClick) {
        this.handleOnNoDataRequired();
    }
}

/**
 * Handles validation errors
 */
function handleOnError(cbObj: CbObjOnError, hasUnsupportedCard: boolean = null): boolean {
    // If we're in an "unsupported card" state and a 'regular' card number error comes through - ignore it until the "unsupported card" state is cleared
    if (this.state.hasUnsupportedCard && cbObj.fieldType === ENCRYPTED_CARD_NUMBER && hasUnsupportedCard === null) {
        // Temporary - for testing in development
        if (process.env.NODE_ENV === 'development') {
            throw new Error('SecuredFieldsProviderHandlers::handleOnError:: IN UNSUPPORTED CARD STATE');
        }
    }

    const verifiedErrorCode = getVerifiedErrorCode(cbObj.fieldType, cbObj.error, this.props.i18n);

    this.setState(prevState => ({
        errors: { ...prevState.errors, [cbObj.fieldType]: verifiedErrorCode || false },
        hasUnsupportedCard: hasUnsupportedCard !== null ? hasUnsupportedCard : false
    }));

    cbObj.errorI18n = this.props.i18n.get(verifiedErrorCode); // Add translation

    const errorExplained = getError(verifiedErrorCode);
    cbObj.errorText = errorExplained !== '' ? errorExplained : ERROR_MSG_CLEARED; // Add internal explanation

    this.props.onError(cbObj);

    return true;
}

function handleFocus(cbObj: CbObjOnFocus): void {
    if (cbObj.fieldType === ENCRYPTED_SECURITY_CODE) {
        this.numCharsInCVC = cbObj.numChars;
    }

    this.props.onFocus(cbObj);
}

// Only called for holder name
function handleOnAutoComplete(cbObj: CbObjOnAutoComplete): void {
    this.setState({ autoCompleteName: cbObj.value }, () => {
        this.props.onChange(this.state);
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
    handleOnNoDataRequired
};
