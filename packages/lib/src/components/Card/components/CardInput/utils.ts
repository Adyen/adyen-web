import Language from '../../../../language/Language';
import { AddressModeOptions, CardInputProps, LayoutObj } from './types';
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
import { BRAND_READABLE_NAME_MAP, DEFAULT_CARD_GROUP_TYPES } from '../../../internal/SecuredFields/lib/constants';
import useImage, { UseImageHookType } from '../../../../core/Context/useImage';
import { SF_ErrorCodes } from '../../../../core/Errors/constants';
import { BrandObject, CardBrandsConfiguration, CardConfiguration, DualBrandSelectElement } from '../../types';
import { CardConfigData } from '../../../../core/Analytics/types';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from '../../../ThreeDS2/constants';
import CardInputDefaultProps from './defaultProps';
import { isConfigurationValid as isFastlaneComponentConfigValid } from '../Fastlane/utils/validate-configuration';
import { notFalsy } from '../../../../utils/commonUtils';

export const getCardImageUrl = (brand: string, getImage: UseImageHookType): string => {
    const imageOptions = {
        type: brand === 'card' ? 'nocard' : brand || 'nocard',
        extension: 'svg'
    };

    return getImage(imageOptions)(brand);
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

/**
 * Lookup service to map local (CardInput) field refs to a key, possibly region specific, by which to retrieve the translation
 */
export const mapFieldKey = (key: string, i18n: Language, countrySpecificLabels: StringObject): string => {
    // console.log('### utils::mapFieldKey:: key', key);
    switch (key) {
        case 'socialSecurityNumber':
            return i18n.get(`boleto.${key}`);
        // Address related - if we have a country specific key for the field - use that to get the translation
        case 'street':
        case 'houseNumberOrName':
        case 'postalCode':
        case 'stateOrProvince':
        case 'city':
        case 'country':
            return countrySpecificLabels?.[key] ? i18n.get(countrySpecificLabels?.[key]) : i18n.get(key);
        // We know that the translated error messages do contain a reference to the field they refer to, so we won't need to map them (currently applies mostly to SecuredFields related errors)
        default:
            return null;
    }
};

export const extractPropsForCardFields = (props: CardInputProps) => {
    return {
        // Extract props for CardFieldsWrapper & StoredCardFieldsWrapper(just needs amount, hasCVC, installmentOptions)
        amount: props.amount,
        billingAddressRequired: props.billingAddressRequired,
        billingAddressRequiredFields: props.billingAddressRequiredFields,
        billingAddressAllowedCountries: props.billingAddressAllowedCountries,
        brandsConfiguration: props.brandsConfiguration,
        showStoreDetailsCheckbox: props.showStoreDetailsCheckbox,
        hasCVC: props.hasCVC,
        hasHolderName: props.hasHolderName,
        holderNameRequired: props.holderNameRequired,
        installmentOptions: props.installmentOptions,
        placeholders: props.placeholders,
        positionHolderNameOnTop: props.positionHolderNameOnTop,
        // Extract props for CardFields > CardNumber
        showBrandIcon: props.showBrandIcon,
        showContextualElement: props.showContextualElement,
        // Extract props for StoredCardFields
        lastFour: props.lastFour,
        expiryMonth: props.expiryMonth,
        expiryYear: props.expiryYear,
        disclaimerMessage: props.disclaimerMessage
    };
};

export const extractPropsForSFP = (props: CardInputProps) => {
    return {
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
        maskSecurityCode: props.maskSecurityCode,
        exposeExpiryDate: props.exposeExpiryDate,
        minimumExpiryDate: props.minimumExpiryDate,
        onAdditionalSFConfig: props.onAdditionalSFConfig,
        onAdditionalSFRemoved: props.onAdditionalSFRemoved,
        onAllValid: props.onAllValid,
        onAutoComplete: props.onAutoComplete,
        onBinValue: props.onBinValue,
        onConfigSuccess: props.onConfigSuccess,
        handleKeyPress: props.handleKeyPress,
        onError: props.onError,
        onFieldValid: props.onFieldValid,
        onLoad: props.onLoad,
        placeholders: props.placeholders,
        resources: props.resources,
        showContextualElement: props.showContextualElement,
        showWarnings: props.showWarnings,
        trimTrailingSeparator: props.trimTrailingSeparator
    } as SFPProps; // Can't set as return type on fn or it will complain about missing, mandatory, props
};

export const handlePartialAddressMode = (addressMode: AddressModeOptions): AddressSpecifications | null => {
    return addressMode == AddressModeOptions.partial ? PARTIAL_ADDRESS_SCHEMA : null;
};

// Almost all errors are blur based, but some SF ones are not i.e. when an unsupported card is entered or the expiry date is out of range
export function lookupBlurBasedErrors(errorCode) {
    // If it's NOT one of these, then it's a blur based error
    return ![
        SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED,
        SF_ErrorCodes.ERROR_MSG_CARD_TOO_OLD,
        SF_ErrorCodes.ERROR_MSG_CARD_TOO_FAR_IN_FUTURE,
        SF_ErrorCodes.ERROR_MSG_CARD_EXPIRES_TOO_SOON
    ].includes(errorCode);
}

export function getFullBrandName(brand) {
    return BRAND_READABLE_NAME_MAP[brand] ?? brand;
}

export const getCardConfigData = (cardProps: CardConfiguration): CardConfigData => {
    const MAX_LENGTH = 128;

    // Extract props from cardProps - mostly setting a default value, if prop not found
    const {
        autoFocus,
        billingAddressAllowedCountries,
        billingAddressMode,
        billingAddressRequired,
        billingAddressRequiredFields,
        brands = DEFAULT_CARD_GROUP_TYPES,
        brandsConfiguration,
        challengeWindowSize = DEFAULT_CHALLENGE_WINDOW_SIZE,
        configuration,
        countryCode,
        data,
        disclaimerMessage,
        disableIOSArrowKeys,
        doBinLookup,
        enableStoreDetails,
        exposeExpiryDate,
        fastlaneConfiguration,
        forceCompat,
        hasHolderName,
        hideCVC,
        holderNameRequired,
        installmentOptions,
        keypadFix,
        legacyInputMode,
        maskSecurityCode,
        minimumExpiryDate,
        name, // = 'none',
        placeholders,
        positionHolderNameOnTop,
        showBrandIcon,
        showInstallmentAmounts,
        showPayButton = false, // hard coded default
        styles,
        trimTrailingSeparator,
        onAllValid,
        onBinLookup,
        onBinValue,
        onBlur,
        onBrand,
        onConfigSuccess,
        onEnterKeyPressed,
        onFieldValid,
        onFocus,
        onLoad
    } = cardProps;

    const dataString = JSON.stringify(CardInputDefaultProps.data);

    const srPanelEnabled = cardProps.modules?.srPanel?.enabled;
    const srPanelMoveFocus = cardProps.modules?.srPanel?.moveFocus;

    const riskEnabled = cardProps.modules?.risk?.enabled;

    const isFastlaneConfigValid = isFastlaneComponentConfigValid(fastlaneConfiguration);

    const billingAddressModeValue = cardProps.onAddressLookup ? 'lookup' : billingAddressMode;

    let showKCPType: 'none' | 'auto' | 'atStart' = 'none';
    if (configuration?.koreanAuthenticationRequired === true) {
        showKCPType = countryCode?.toLowerCase() === 'kr' ? 'atStart' : 'auto';
    }

    const configData: CardConfigData = {
        autoFocus,
        ...(billingAddressAllowedCountries?.length > 0 && {
            billingAddressAllowedCountries: billingAddressAllowedCountries.toString().substring(0, MAX_LENGTH)
        }),
        billingAddressMode: billingAddressModeValue,
        billingAddressRequired,
        billingAddressRequiredFields: billingAddressRequiredFields?.toString()?.substring(0, MAX_LENGTH),
        // Probably just for development - in real life we wouldn't expect the number of supported brands to push the endpoint limit on 128 chars
        brands: brands?.toString()?.substring(0, MAX_LENGTH),
        challengeWindowSize,
        disableIOSArrowKeys,
        doBinLookup,
        enableStoreDetails,
        exposeExpiryDate,
        forceCompat,
        hasBrandsConfiguration: notFalsy(brandsConfiguration),
        hasData: data && JSON.stringify(cardProps.data) !== dataString,
        hasDisclaimerMessage: !!disclaimerMessage,
        hasHolderName,
        hasInstallmentOptions: notFalsy(installmentOptions),
        hasPlaceholders: notFalsy(placeholders), // has merchant defined placeholders
        hasStylesConfigured: notFalsy(styles),
        hideCVC,
        holderNameRequired,
        keypadFix,
        legacyInputMode,
        maskSecurityCode,
        minimumExpiryDate: !!minimumExpiryDate, // Potentially, in the future, we can send the actual string value
        name,
        positionHolderNameOnTop,
        riskEnabled,
        showBrandIcon,
        showInstallmentAmounts: !!showInstallmentAmounts,
        showKCPType,
        showPayButton,
        socialSecurityNumberMode: configuration?.socialSecurityNumberMode,
        srPanelEnabled,
        srPanelMoveFocus,
        trimTrailingSeparator,
        /** callbacks */
        // We need to detect if the merchant themselves has defined these, not if we've set them as a default
        hasOnAllValid: onAllValid !== CardInputDefaultProps.onAllValid,
        hasOnBinValue: onBinValue !== CardInputDefaultProps.onBinValue,
        hasOnBlur: onBlur !== CardInputDefaultProps.onBlur,
        hasOnBrand: onBrand !== CardInputDefaultProps.onBrand,
        hasOnConfigSuccess: onConfigSuccess !== CardInputDefaultProps.onConfigSuccess,
        hasOnFieldValid: onFieldValid !== CardInputDefaultProps.onFieldValid,
        hasOnFocus: onFocus !== CardInputDefaultProps.onFocus,
        hasOnLoad: onLoad !== CardInputDefaultProps.onLoad,
        // Card level props
        hasOnBinLookup: !!onBinLookup,
        hasOnEnterKeyPressed: !!onEnterKeyPressed,
        /**
         * Fastlane
         */
        ...(isFastlaneConfigValid && {
            hasFastlaneConfigured: true,
            isFastlaneConsentDefaultOn: fastlaneConfiguration.defaultToggleState
        })
    };

    return configData;
};

export const mapDualBrandButtons = (dualBrandSelectElements: DualBrandSelectElement[], brandsConfiguration: CardBrandsConfiguration): any => {
    return dualBrandSelectElements.map(item => {
        const brand = item.id;
        const getImage = useImage();
        const imageName = brand === 'card' ? 'nocard' : brand;
        const imageURL = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, getImage);

        // TODO - check below if we have to still generate altName through the mapping function or whether it just
        //  corresponds to item.brandObject.localeBrand
        return {
            id: item.id,
            name: item.brandObject.localeBrand || item.brandObject.brand,
            imageURL,
            altName: getFullBrandName(brand)
        };
    });
};

/**
 *  Only if the brands in EU_BrandArray are present in the binLookup response should we handle dual branding based on EU regulations
 *
 * If the result from Array.some is true - then we are in a EU dual branding regulation scenario, i.e.
 * - Show the new dualBranding UI Buttons
 * - Preselect a card brand
 */
export const mustHandleDualBrandingAccordingToEURegulations = (
    EU_BrandArray: readonly string[],
    returnedDualBrandingObjects: DualBrandSelectElement[] | BrandObject[],
    key: string
) => returnedDualBrandingObjects.some(item => EU_BrandArray.includes(item[key]));
