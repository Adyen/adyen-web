import { UIElementProps } from '../UIElement';
import { AddressSchema } from '../../types';
import {
    CbObjOnBinValue,
    CbObjOnBrand,
    CbObjOnConfigSuccess,
    CbObjOnError,
    CbObjOnFieldValid,
    CbObjOnFocus,
    CbObjOnLoad
} from '../internal/SecuredFields/lib/types';

export interface CardElementProps extends UIElementProps {
    type?: string;
    brand?: string;

    /** @deprecated use brands instead */
    groupTypes?: string[];

    /** List of brands accepted by the component */
    brands?: string[];

    /** Show/hide the "store details" checkbox */
    enableStoreDetails?: boolean;

    /** Show/hide the CVC field */
    hideCVC?: boolean;

    /** Show/hide the card holder name field */
    hasHolderName?: boolean;

    /** Whether the card holder name field will be required */
    holderNameRequired?: boolean;

    configuration?: CardConfiguration;

    /**
     * Called once all the card input fields have been created but are not yet ready to use.
     */
    onLoad?: (event: CbObjOnLoad) => void;

    /**
     * Called once the card input fields are ready to use.
     */
    onConfigSuccess?: (event: CbObjOnConfigSuccess) => void;

    /**
     * Called when a field becomes valid and also if a valid field changes and becomes invalid.
     * For the card number field, it returns the last 4 digits of the card number.
     */
    onFieldValid?: (event: CbObjOnFieldValid) => void;

    /**
     * Called once we detect the card brand.
     */
    onBrand?: (event: CbObjOnBrand) => void;

    /**
     * Called in case of an invalid card number, invalid expiry date, or incomplete field. Called again when errors are cleared.
     */
    onError?: (event: CbObjOnError) => void;

    /**
     * Called when a field gains or loses focus.
     */
    onFocus?: (event: CbObjOnFocus) => void;

    /**
     * Provides the BIN Number of the card (up to 6 digits), called as the user types in the PAN.
     */
    onBinValue?: (event: CbObjOnBinValue) => void;

    [key: string]: any;
}

export interface CardConfiguration {
    koreanAuthenticationRequired?: boolean;
}

interface CardPaymentMethodData {
    type: string;
    brand?: string;
    storedPaymentMethodId?: string;
    fundingSource?: string;
    holderName?: string;
    encryptedCardNumber?: string;
    encryptedExpiryMonth?: string;
    encryptedExpiryYear?: string;
    encryptedSecurityCode?: string;
}

interface BrowserInfo {
    acceptHeader: string;
    colorDepth: string;
    language: string;
    javaEnabled: boolean;
    screenHeight: string;
    screenWidth: string;
    userAgent: string;
    timeZoneOffset: number;
}

export interface CardElementData {
    paymentMethod: CardPaymentMethodData;
    billingAddress?: AddressSchema;
    installments?: { value: number };
    storePaymentMethod?: boolean;
    browserInfo: BrowserInfo;
}
