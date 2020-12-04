import { validateHolderName } from './validate';
import { CbObjOnFocus, CbObjOnBrand } from '../../../internal/SecuredFields/lib/types';
import { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';

// Validate whole cardInput component i.e holderName + securedFields
function validateCardInput(): void {
    const holderNameValid: boolean = validateHolderName(this.state.data.holderName, this.props.holderNameRequired);
    const sfpValid: boolean = this.state.isSfpValid;
    const addressValid: boolean = this.props.billingAddressRequired ? this.state.valid.billingAddress : true;

    const isKorea = this.state.issuingCountryCode ? this.state.issuingCountryCode === 'kr' : this.props.countryCode === 'kr';
    const koreanAuthentication =
        this.props.configuration.koreanAuthenticationRequired && isKorea
            ? !!this.state.valid.taxNumber && !!this.state.valid.encryptedPassword
            : true;

    const isValid: boolean = sfpValid && holderNameValid && addressValid && koreanAuthentication;

    this.setState({ isValid }, () => {
        this.props.onChange(this.state);
    });
}

function handleAddress(address): void {
    const setAddress = (prevState: SFPState): SFPState => ({
        ...prevState,
        billingAddress: address.data,
        valid: {
            ...prevState.valid,
            billingAddress: address.isValid
        }
    });

    this.setState(setAddress, this.validateCardInput);
}

/**
 * Saves the KCP Authentication details in state
 */
function handleKCPAuthentication(data: object, valid: object): void {
    const setKCP = (prevState: SFPState): SFPState => ({
        data: { ...prevState.data, ...data },
        valid: { ...prevState.valid, ...valid }
    });
    this.setState(setKCP, this.validateCardInput);
}

/**
 * Saves the storeDetails in state
 */
function handleOnStoreDetails(storeDetails: boolean): void {
    this.setState({ storePaymentMethod: storeDetails }, this.validateCardInput);
}

/**
 * Saves the holderName in state
 */
function handleHolderName(e: Event): void {
    const holderName = (e.target as HTMLInputElement).value;
    const setHolderName = (prevState: SFPState): SFPState => ({
        data: { ...prevState.data, holderName },
        errors: { ...prevState.errors, holderName: this.props.holderNameRequired ? !validateHolderName(holderName) : false },
        valid: {
            ...prevState.valid,
            holderName: this.props.holderNameRequired ? validateHolderName(holderName, this.props.holderNameRequired) : true
        }
    });

    this.setState(setHolderName, this.validateCardInput);
}

function handleInstallments(installments): void {
    this.setState({ installments }, this.validateCardInput);
}

function handleSecuredFieldsChange(newState: SFPState): void {
    const sfState: SFPState = newState;

    const tempHolderName: string = sfState.autoCompleteName && this.props.hasHolderName ? sfState.autoCompleteName : this.state.data.holderName;

    const setSfpData = (prevState: SFPState): SFPState => ({
        ...prevState,
        data: {
            ...this.state.data,
            ...sfState.data,
            holderName: tempHolderName
        },
        errors: { ...this.state.errors, ...sfState.errors },
        valid: {
            ...this.state.valid,
            ...sfState.valid,
            holderName: this.props.holderNameRequired ? validateHolderName(tempHolderName, this.props.holderNameRequired) : true
        },
        isSfpValid: sfState.isSfpValid
    });

    this.setState(setSfpData, this.validateCardInput);
}

/**
 * Saves the card brand in state
 */
function handleOnBrand(cardInfo: CbObjOnBrand): void {
    this.setState({ brand: cardInfo.brand, hideCVCForBrand: !!cardInfo.hideCVC }, () => {
        this.props.onBrand(cardInfo);
    });
}

/**
 * Saves the currently focused element in state
 */
function handleFocus(e: CbObjOnFocus): void {
    const isFocused: boolean = e.focus === true;

    this.setState({ focusedElement: e.currentFocusObject });

    if (isFocused) {
        this.props.onFocus(e);
    } else {
        this.props.onBlur(e);
    }
}

/**
 * Handler for the select element added in response to the /binLookup call
 */
function handleAdditionalDataSelection(e: Event): void {
    const field: HTMLLIElement = e.currentTarget as HTMLLIElement;
    const value: string = field.getAttribute('data-value');

    this.setState({ additionalSelectValue: value }, this.validateCardInput);

    // Pass brand into SecuredFields
    if (this.state.additionalSelectType === 'brandSwitcher') {
        this.sfp.current.processBinLookupResponse({ issuingCountryCode: this.state.issuingCountryCode, supportedBrands: [value] });
    }
}

export default {
    handleFocus,
    handleAddress,
    handleKCPAuthentication,
    handleOnStoreDetails,
    handleHolderName,
    handleInstallments,
    handleSecuredFieldsChange,
    handleOnBrand,
    handleAdditionalDataSelection,
    validateCardInput
};
