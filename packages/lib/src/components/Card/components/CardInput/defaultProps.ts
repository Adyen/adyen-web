import { SocialSecurityMode } from '../../types';
import { AddressModeOptions } from './types';
import {
    CardAllValidData,
    CardBinValueData,
    CardBrandData,
    CardConfigSuccessData,
    CardFieldValidData,
    CardFocusData,
    CardLoadData
} from '../../../internal/SecuredFields/lib/types';
import { AdyenCheckoutError } from '../../../../types';

export default {
    type: 'scheme',

    setComponentRef: () => {},

    // Settings
    autoFocus: true,
    billingAddressAllowedCountries: [],
    billingAddressMode: AddressModeOptions.full,
    billingAddressRequired: false,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],

    configuration: { koreanAuthenticationRequired: false, socialSecurityNumberMode: 'auto' as SocialSecurityMode },
    data: {
        billingAddress: {}
    },
    disableIOSArrowKeys: false,
    enableStoreDetails: false,
    exposeExpiryDate: false,
    forceCompat: false,
    hasHolderName: false,
    holderNameRequired: false,
    hasCVC: true,
    hideCVC: false,
    installmentOptions: {},
    keypadFix: true,
    legacyInputMode: false,
    maskSecurityCode: false,
    minimumExpiryDate: null,
    name: null, // Affects Dropin only, the name displayed in the PMList item
    placeholders: {},
    positionHolderNameOnTop: false,
    showBrandIcon: true,
    showInstallmentAmounts: null,
    styles: {},
    trimTrailingSeparator: true,

    isPayButtonPrimaryVariant: true,
    showContextualElement: true,

    // Events
    onLoad: (_: CardLoadData): void => {},
    onConfigSuccess: (_: CardConfigSuccessData): void => {},
    onAllValid: (_: CardAllValidData): void => {},
    onFieldValid: (_: CardFieldValidData): void => {},
    onBrand: (_: CardBrandData): void => {},
    onError: (_: AdyenCheckoutError): void => {},
    onBinValue: (_: CardBinValueData): void => {},
    onBlur: (_: CardFocusData): void => {},
    onFocus: (_: CardFocusData): void => {},
    onChange: (): void => {}
};
