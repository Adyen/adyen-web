import { validateHolderName } from './validate';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import { BrandObject } from '../../types';

// Validate whole cardInput component i.e holderName + securedFields
function validateCardInput(who): void {
    const holderNameValid: boolean = validateHolderName(this.state.data.holderName, this.props.holderNameRequired);
    const sfpValid: boolean = this.state.isSfpValid;
    const addressValid: boolean = this.props.billingAddressRequired ? this.state.valid.billingAddress : true;

    const isKorea = this.state.issuingCountryCode ? this.state.issuingCountryCode === 'kr' : this.props.countryCode === 'kr';
    const koreanAuthentication =
        this.props.configuration.koreanAuthenticationRequired && isKorea
            ? !!this.state.valid.taxNumber && !!this.state.valid.encryptedPassword
            : true;

    const isValid: boolean = sfpValid && holderNameValid && addressValid && koreanAuthentication;

    console.log(who, '### handlers::validateCardInput:: isSfpValid=', sfpValid);

    this.setState({ isValid }, () => {
        this.props.onChange(this.state);
        if (window['card']) {
            console.log(who, '### handlers::validateCardInput:: window.card.isValid=', window['card'].isValid);
        }
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

    this.setState(setAddress, () => {
        this.validateCardInput('handleAddress');
    });
}

/**
 * Saves the KCP Authentication details in state
 */
function handleKCPAuthentication(data: object, valid: object): void {
    const setKCP = (prevState: SFPState): SFPState => ({
        data: { ...prevState.data, ...data },
        valid: { ...prevState.valid, ...valid }
    });
    this.setState(setKCP, () => {
        this.validateCardInput('handleKCPAuthentication');
    });
}

/**
 * Saves the storeDetails in state
 */
function handleOnStoreDetails(storeDetails: boolean): void {
    this.setState({ storePaymentMethod: storeDetails }, () => {
        this.validateCardInput('handleOnStoreDetails');
    });
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

    this.setState(setHolderName, () => {
        this.validateCardInput('handleHolderName');
    });
}

function handleInstallments(installments): void {
    this.setState({ installments }, () => {
        this.validateCardInput('handleInstallments');
    });
}

function handleSecuredFieldsChange(newState: SFPState, who: string): void {
    const sfState: SFPState = newState;

    const tempHolderName: string = sfState.autoCompleteName && this.props.hasHolderName ? sfState.autoCompleteName : this.state.data.holderName;

    console.log(who, '### handlers::handleSecuredFieldsChange:: SETTING isSfpValid=', sfState.isSfpValid);

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
        isSfpValid: sfState.isSfpValid,
        hideCVCForBrand: sfState.hideCVCForBrand, // TODO new for Synchrony
        brand: sfState.brand // TODO new for Synchrony
    });

    this.setState(setSfpData, () => {
        this.validateCardInput(who);
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
 * Handler for the icons added in response to the /binLookup call
 */
function handleAdditionalDataSelection(e: Event): void {
    const field: HTMLLIElement = e.currentTarget as HTMLLIElement;
    const value: string = field.getAttribute('data-value');

    // console.log('\n### handlers::handleAdditionalDataSelection:: this.state.isSfpValid-', this.state.isSfpValid);

    this.setState({ additionalSelectValue: value });

    // Find the brandObject with the matching brand value and place into an array
    const brandObjArr: BrandObject[] = this.state.additionalSelectElements.reduce((acc, item) => {
        if (item.brandObject.brand === value) {
            acc.push(item.brandObject);
        }
        return acc;
    }, []);

    // Pass brand object into SecuredFields
    // this.sfp.current.processBinLookupResponse({ issuingCountryCode: this.state.issuingCountryCode, supportedBrands: [value] });
    this.sfp.current.processBinLookupResponse({
        issuingCountryCode: this.state.issuingCountryCode,
        supportedBrands: brandObjArr
    });
}

export default {
    handleFocus,
    handleAddress,
    handleKCPAuthentication,
    handleOnStoreDetails,
    handleHolderName,
    handleInstallments,
    handleSecuredFieldsChange,
    handleAdditionalDataSelection,
    validateCardInput
};
