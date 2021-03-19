import { validateHolderName } from './validate';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import { BrandObject } from '../../types';
import { formatCPFCNPJ } from '../../../Boleto/components/SocialSecurityNumberBrazil/utils';
import validateSSN from '../../../Boleto/components/SocialSecurityNumberBrazil/validate';

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

    this.setState(setAddress);
}

/**
 * Saves the KCP Authentication details in state
 */
function handleKCPAuthentication(data: object, valid: object): void {
    const setKCP = (prevState: SFPState): SFPState => ({
        data: { ...prevState.data, ...data },
        valid: { ...prevState.valid, ...valid }
    });
    this.setState(setKCP);
}

/**
 * Formats and saves the Brazilian social secuirity number details in state
 */
function handleCPF(e: Event, validate = false): void {
    const socialSecurityNumber = formatCPFCNPJ((e.target as HTMLInputElement).value);
    const isValid = validateSSN(socialSecurityNumber);
    console.log(isValid);
    const setHolderName = (prevState: SFPState): SFPState => ({
        ...prevState,
        data: { ...prevState.data, socialSecurityNumber },
        errors: { ...prevState.errors, socialSecurityNumber: validate && !isValid },
        valid: {
            ...prevState.valid,
            socialSecurityNumber: isValid
        }
    });

    this.setState(setHolderName);
}

/**
 * Saves the storeDetails in state
 */
function handleOnStoreDetails(storeDetails: boolean): void {
    this.setState({ storePaymentMethod: storeDetails });
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

    this.setState(setHolderName);
}

function handleInstallments(installments): void {
    this.setState({ installments });
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
        isSfpValid: sfState.isSfpValid,
        cvcPolicy: sfState.cvcPolicy,
        hideDateForBrand: sfState.hideDateForBrand,
        brand: sfState.brand
    });

    this.setState(setSfpData);
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
    const value: string = (e.target as HTMLLIElement).getAttribute('data-value');

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
    handleCPF,
    handleOnStoreDetails,
    handleHolderName,
    handleInstallments,
    handleSecuredFieldsChange,
    handleAdditionalDataSelection,
    validateCardInput
};
