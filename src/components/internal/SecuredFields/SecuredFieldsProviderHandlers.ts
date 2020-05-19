import { getCardImageUrl } from './utils';
import { ENCRYPTED_SECURITY_CODE } from './constants';
import {
    CbObjOnError,
    CbObjOnFocus,
    CbObjOnBrand,
    CbObjOnAllValid,
    CbObjOnFieldValid,
    CbObjOnAutoComplete,
    CbObjOnConfigSuccess,
    CbObjOnLoad
} from '~/components/internal/SecuredFields/lib/types';

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
function handleOnAllValid(status: CbObjOnAllValid): void {
    this.setState({ isSfpValid: status.allValid }, () => {
        this.props.onAllValid(status); // Propagate onAllValid event
    });
}

/**
 * Saves a field value from CSF in the CardInput state
 * Emits the onFieldValid event
 */
function handleOnFieldValid(field: CbObjOnFieldValid): void {
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
function handleOnError(cbObj: CbObjOnError): void {
    this.setState(prevState => ({
        errors: { ...prevState.errors, [cbObj.fieldType]: cbObj.error || false }
    }));

    this.props.onError(cbObj);
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
