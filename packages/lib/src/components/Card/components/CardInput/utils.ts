import { getImageUrl } from '../../../../utils/get-image';
import { ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import Language from '../../../../language/Language';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import { AddressModeOptions, CardInputProps, LayoutObj, SortErrorsObj } from './types';
import {
    CREDIT_CARD,
    CREDIT_CARD_NAME_BOTTOM,
    CREDIT_CARD_NAME_TOP,
    KCP_CARD,
    KCP_CARD_NAME_BOTTOM,
    KCP_CARD_NAME_TOP,
    SSN_CARD,
    SSN_CARD_NAME_BOTTOM,
    SSN_CARD_NAME_TOP
} from './layouts';
import { AddressSpecifications, StringObject } from '../../../internal/Address/types';
import { PARTIAL_ADDRESS_SCHEMA } from '../../../internal/Address/constants';
import { InstallmentsObj } from './components/Installments/Installments';
import { SFPProps } from '../../../internal/SecuredFields/SFP/types';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE
} from '../../../internal/SecuredFields/lib/configuration/constants';
import { useEffect, useRef } from 'preact/hooks';

export const getCardImageUrl = (brand: string, loadingContext: string): string => {
    const imageOptions = {
        type: brand === 'card' ? 'nocard' : brand || 'nocard',
        extension: 'svg',
        loadingContext
    };

    return getImageUrl(imageOptions)(brand);
};

/**
 * Verifies that installment object is valid to send to the Backend.
 * Valid means that it has 'revolving' plan set, or the number of installments is bigger than one
 */
export const hasValidInstallmentsObject = (installments?: InstallmentsObj) => {
    return installments?.plan === 'revolving' || installments?.value > 1;
};

export const getLayout = ({
    props,
    showKCP,
    showBrazilianSSN,
    countrySpecificSchemas = null,
    billingAddressRequiredFields = null
}: LayoutObj): string[] => {
    let layout = CREDIT_CARD;
    const hasRequiredHolderName = props.hasHolderName && props.holderNameRequired;

    if (hasRequiredHolderName) {
        layout = props.positionHolderNameOnTop ? CREDIT_CARD_NAME_TOP : CREDIT_CARD_NAME_BOTTOM;
    }

    if (showKCP) {
        layout = KCP_CARD;
        if (hasRequiredHolderName) {
            layout = props.positionHolderNameOnTop ? KCP_CARD_NAME_TOP : KCP_CARD_NAME_BOTTOM;
        }
    }

    if (showBrazilianSSN) {
        layout = SSN_CARD;
        if (hasRequiredHolderName) {
            layout = props.positionHolderNameOnTop ? SSN_CARD_NAME_TOP : SSN_CARD_NAME_BOTTOM;
        }
    }

    // w. Billing address
    if (countrySpecificSchemas) {
        // Flatten array and remove any numbers that describe how fields should be aligned
        const countrySpecificSchemasFlat: string[] = countrySpecificSchemas['flat'](2).filter(item => typeof item !== 'number') as string[];

        let countryBasedAddressLayout = countrySpecificSchemasFlat;

        if (billingAddressRequiredFields) {
            // Get intersection of the 2 arrays
            countryBasedAddressLayout = countrySpecificSchemasFlat.filter(x => billingAddressRequiredFields.includes(x));
        }

        layout = CREDIT_CARD.concat(countryBasedAddressLayout);
        if (hasRequiredHolderName) {
            layout = props.positionHolderNameOnTop
                ? CREDIT_CARD_NAME_TOP.concat(countryBasedAddressLayout)
                : CREDIT_CARD_NAME_BOTTOM.concat(countryBasedAddressLayout);
        }
        // TODO we are not yet creating a layout for AVS + SSN field (w. or w/o holderName) - is AVS + SSN a real world scenario?
    }
    return layout;
};

const mapFieldKey = (key: string, i18n: Language, countrySpecificLabels: StringObject): string => {
    // console.log('### utils::mapFieldKey:: key', key);
    switch (key) {
        case 'socialSecurityNumber':
            return i18n.get(`boleto.${key}`);
        // address related
        case 'street':
        case 'houseNumberOrName':
        case 'postalCode':
        case 'stateOrProvince':
        case 'city':
        case 'country':
            return countrySpecificLabels?.[key] ? i18n.get(countrySpecificLabels?.[key]) : i18n.get(key);
        // securedFields related
        case ENCRYPTED_CARD_NUMBER:
        case ENCRYPTED_EXPIRY_DATE:
        case ENCRYPTED_SECURITY_CODE:
        case ENCRYPTED_PWD_FIELD:
        case 'holderName':
        case 'taxNumber':
            return null;

        default: {
            // Map all securedField field types to 'creditCard' - with 2 exceptions
            const type = ['ach', 'giftcard'].includes(key) ? key : 'creditCard';
            return i18n.get(`${type}.${key}.aria.label`);
        }
    }
};

export const sortErrorsForPanel = ({ errors, layout, i18n, countrySpecificLabels }: SortErrorsObj): ErrorPanelObj => {
    console.log('### utils::sortErrorsForPanel:: errors', errors);

    // Create array of fields with active errors, ordered according to passed layout
    const fieldList = Object.entries(errors).reduce((acc, [key, value]) => {
        if (value) {
            acc.push(key);
            acc.sort((a, b) => layout.indexOf(a) - layout.indexOf(b));
        }
        return acc;
    }, []);

    if (!fieldList || !fieldList.length) return null;

    // Create array of error messages to display, using previously created, ordered, fieldList to also keep error messages in the right order
    const errorMessages = fieldList.map(key => {
        // Get translation for field type
        const fieldType: string = mapFieldKey(key, i18n, countrySpecificLabels);

        const errorObj = errors[key];

        /**
         * Get corresponding error msg
         *
         * NOTE: the error object for a secured field already contains the error in a translated form (errorI18n).
         * For other fields we still need to translate it
         */
        const errorMsg = hasOwnProperty(errorObj, 'errorI18n') ? errorObj.errorI18n + '-sr' : i18n.get(errorObj.errorMessage) + '-sr';

        // If necessary append field type to start of error message
        return fieldType ? `${fieldType}: ${errorMsg}.` : errorMsg;
    });

    // Create array of error codes for reference
    const errorCodes = fieldList.map(key => {
        const errorObj = errors[key];
        const errorCode = hasOwnProperty(errorObj, 'error') ? errorObj.error : errorObj.errorMessage;
        return errorCode;
    });

    return !errorMessages.length ? null : { errorMessages, fieldList, errorCodes };
};

export const extractPropsForCardFields = (props: CardInputProps) => {
    return {
        // Extract props for CardFieldsWrapper & StoredCardFieldsWrapper(just needs amount, hasCVC, installmentOptions)
        amount: props.amount,
        billingAddressRequired: props.billingAddressRequired,
        billingAddressRequiredFields: props.billingAddressRequiredFields,
        billingAddressAllowedCountries: props.billingAddressAllowedCountries,
        brandsConfiguration: props.brandsConfiguration,
        enableStoreDetails: props.enableStoreDetails,
        hasCVC: props.hasCVC,
        hasHolderName: props.hasHolderName,
        holderNameRequired: props.holderNameRequired,
        installmentOptions: props.installmentOptions,
        placeholders: props.placeholders,
        positionHolderNameOnTop: props.positionHolderNameOnTop,
        // Extract props for CardFields > CardNumber
        showBrandIcon: props.showBrandIcon,
        showBrandsUnderCardNumber: props.showBrandsUnderCardNumber,
        // Extract props for StoredCardFields
        lastFour: props.lastFour,
        expiryMonth: props.expiryMonth,
        expiryYear: props.expiryYear
    };
};

export const extractPropsForSFP = (props: CardInputProps) => {
    return {
        allowedDOMAccess: props.allowedDOMAccess,
        autoFocus: props.autoFocus,
        brands: props.brands,
        brandsConfiguration: props.brandsConfiguration,
        clientKey: props.clientKey,
        countryCode: props.countryCode,
        forceCompat: props.forceCompat,
        i18n: props.i18n,
        implementationType: props.implementationType,
        keypadFix: props.keypadFix,
        legacyInputMode: props.legacyInputMode,
        loadingContext: props.loadingContext,
        minimumExpiryDate: props.minimumExpiryDate,
        onAdditionalSFConfig: props.onAdditionalSFConfig,
        onAdditionalSFRemoved: props.onAdditionalSFRemoved,
        onAllValid: props.onAllValid,
        onAutoComplete: props.onAutoComplete,
        onBinValue: props.onBinValue,
        onConfigSuccess: props.onConfigSuccess,
        onError: props.onError,
        onFieldValid: props.onFieldValid,
        onLoad: props.onLoad,
        showWarnings: props.showWarnings,
        trimTrailingSeparator: props.trimTrailingSeparator,
        maskSecurityCode: props.maskSecurityCode
    } as SFPProps; // Can't set as return type on fn or it will complain about missing, mandatory, props
};

export const handlePartialAddressMode = (addressMode: AddressModeOptions): AddressSpecifications | null => {
    return addressMode == AddressModeOptions.partial ? PARTIAL_ADDRESS_SCHEMA : null;
};

// Almost all errors are blur based, but some SF ones are not i.e. when an unsupported card is entered or the expiry date is out of range
export function lookupBlurBasedErrors(errorCode) {
    return !['error.va.sf-cc-num.03', 'error.va.sf-cc-dat.01', 'error.va.sf-cc-dat.02', 'error.va.sf-cc-dat.03'].includes(errorCode);
}

// Hook
export function usePrevious<T>(value: T): T {
    const ref: any = useRef<T>();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value
    return ref.current;
}
