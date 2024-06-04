import { AnalyticsData, AnalyticsObject, ConfigData, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_VALIDATION_ERROR_STR, ALLOWED_ANALYTICS_DATA, errorCodeMapping } from './constants';
import uuid from '../../utils/uuid';
import { ERROR_CODES, ERROR_MSG_INCOMPLETE_FIELD } from '../Errors/constants';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_FULL } from '../../components/ThreeDS2/config';
import { CardElementProps } from '../../components/Card/types';
import CardDefaultProps from '../../components/Card/components/CardInput/defaultProps';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component"
 *
 * Error objects have, in addition to the base props:
 *  "code", "errorType" & "message"
 *
 * Log objects have, in addition to the base props:
 *  "message" & "type" &
 *    "subtype" (e.g. when an action is handled)
 *
 * Info objects have, in addition to the base props:
 *   "type" & "target" &
 *     "isStoredPaymentMethod" & "brand" (when a storedCard is "selected"), or,
 *     "validationErrorCode" & "validationErrorMessage" (when the event is describing a validation error)
 *
 *  All objects can also have a "metadata" object of key-value pairs
 */
export const createAnalyticsObject = (aObj: CreateAnalyticsObject): AnalyticsObject => {
    return {
        timestamp: String(getUTCTimestamp()),
        component: aObj.component,
        id: uuid(),
        /** ERROR */
        ...(aObj.event === 'error' && { code: aObj.code, errorType: aObj.errorType, message: aObj.message }), // error event
        /** LOG */
        ...(aObj.event === 'log' && { type: aObj.type, message: aObj.message }), // log event
        ...(aObj.event === 'log' && (aObj.type === ANALYTICS_ACTION_STR || aObj.type === THREEDS2_FULL) && { subType: aObj.subtype }), // only added if we have a log event of Action type or ThreeDS2
        ...(aObj.event === 'log' && aObj.type === THREEDS2_FULL && { result: aObj.result }), // only added if we have a log event ThreeDS2 type
        /** INFO */
        ...(aObj.event === 'info' && { type: aObj.type, target: aObj.target }), // info event
        ...(aObj.event === 'info' && aObj.issuer && { issuer: aObj.issuer }), // relates to issuerLists
        ...(aObj.event === 'info' && { isExpress: aObj.isExpress, expressPage: aObj.expressPage }), // relates to Plugins & detecting Express PMs
        ...(aObj.event === 'info' && aObj.isStoredPaymentMethod && { isStoredPaymentMethod: aObj.isStoredPaymentMethod, brand: aObj.brand }), // only added if we have an info event about a storedPM
        ...(aObj.event === 'info' &&
            // only added if we have an info event describing a validation error
            aObj.type === ANALYTICS_VALIDATION_ERROR_STR && {
                validationErrorCode: mapErrorCodesForAnalytics(aObj.validationErrorCode, aObj.target),
                validationErrorMessage: aObj.validationErrorMessage
            }),
        // ...(aObj.configData && { configData: aObj.configData }),
        /** All */
        ...(aObj.metadata && { metadata: aObj.metadata })
    };
};

const mapErrorCodesForAnalytics = (errorCode: string, target: string) => {
    // Some of the more generic error codes required combination with target to retrieve a specific code
    if (errorCode === ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD] || errorCode === 'invalidFormatExpects') {
        return errorCodeMapping[`${errorCode}.${target}`] ?? errorCode;
    }

    return errorCodeMapping[errorCode] ?? errorCode;
};

export const processAnalyticsData = (analyticsData: AnalyticsData): AnalyticsData => {
    return Object.keys(analyticsData).reduce((acc, prop) => {
        if (ALLOWED_ANALYTICS_DATA.includes(prop)) acc[prop] = analyticsData[prop];
        return acc;
    }, {});
};

export const getCardConfigData = (cardProps: CardElementProps): ConfigData => {
    // Extract props from cardProps - mostly setting a default value, if prop not found
    const {
        autoFocus = CardDefaultProps.autoFocus,
        billingAddressAllowedCountries = CardDefaultProps.billingAddressAllowedCountries,
        billingAddressMode = CardDefaultProps.billingAddressMode,
        billingAddressRequired = CardDefaultProps.billingAddressRequired,
        // billingAddressRequiredFields = CardDefaultProps.billingAddressRequiredFields,
        brands,
        brandsConfiguration,
        challengeWindowSize = DEFAULT_CHALLENGE_WINDOW_SIZE,
        configuration = CardDefaultProps.configuration,
        countryCode,
        data,
        disclaimerMessage,
        disableIOSArrowKeys = CardDefaultProps.disableIOSArrowKeys,
        doBinLookup = true, // from Card.defaultProps
        enableStoreDetails = CardDefaultProps.enableStoreDetails,
        exposeExpiryDate = CardDefaultProps.exposeExpiryDate,
        forceCompat = CardDefaultProps.forceCompat,
        hasHolderName = CardDefaultProps.hasHolderName,
        hideCVC = CardDefaultProps.hideCVC,
        holderNameRequired = CardDefaultProps.holderNameRequired,
        installmentOptions,
        keypadFix = CardDefaultProps.keypadFix,
        legacyInputMode = CardDefaultProps.legacyInputMode,
        maskSecurityCode = CardDefaultProps.maskSecurityCode,
        minimumExpiryDate = CardDefaultProps.minimumExpiryDate,
        name = 'none',
        placeholders,
        positionHolderNameOnTop = CardDefaultProps.positionHolderNameOnTop,
        showBrandIcon = CardDefaultProps.showBrandIcon,
        showBrandsUnderCardNumber = CardDefaultProps.showBrandsUnderCardNumber,
        showInstallmentAmounts = CardDefaultProps.showInstallmentAmounts,
        showPayButton = false, // hard coded default
        styles,
        onAllValid = false,
        onBinLookup = false,
        onBinValue = false,
        onBlur = false,
        onBrand = false,
        onConfigSuccess = false,
        onFieldValid = false,
        onFocus = false,
        onLoad = false
    } = cardProps;

    const billingAddressModeValue = cardProps.onAddressLookup ? 'lookup' : billingAddressMode;

    let hasBrands: true | 'default' | 'single' = true;
    // If brands is not set it indicates that the merchant has not passed the paymentMethods response to Checkout
    // and is therefore relying on the default array.
    // If a single value it indicates the merchant is using a “single branded” card
    if (!brands) {
        hasBrands = 'default';
    } else if (brands.length === 1) {
        hasBrands = 'single';
    }

    let showKCPType: 'none' | 'auto' | 'atStart' = 'none';
    if (configuration?.koreanAuthenticationRequired === true) {
        showKCPType = countryCode?.toLowerCase() === 'kr' ? 'atStart' : 'auto';
    }

    const configData: ConfigData = {
        autoFocus,
        ...(billingAddressRequired ? { billingAddressAllowedCountries } : { billingAddressAllowedCountries: 'none' }),
        billingAddressMode: billingAddressModeValue,
        billingAddressRequired,
        // billingAddressRequiredFields, // do same as for billingAddressAllowedCountries
        // brands, // TODO might just want to know if the array is filled, and if so, whether it has more than 1 item
        brands: hasBrands,
        challengeWindowSize,
        disableIOSArrowKeys,
        doBinLookup,
        enableStoreDetails,
        exposeExpiryDate,
        forceCompat,
        hasBrandsConfiguration: !!brandsConfiguration,
        hasData: !!data,
        hasDisclaimerMessage: !!disclaimerMessage,
        hasHolderName,
        hasInstallmentOptions: !!installmentOptions,
        hasPlaceholders: !!placeholders, // has merchant defined placeholders
        hasStylesConfigured: !!styles,
        hideCVC,
        holderNameRequired,
        keypadFix,
        legacyInputMode,
        maskSecurityCode,
        minimumExpiryDate: !!minimumExpiryDate, // Potentially, in the future, we can send the actual string value
        name,
        positionHolderNameOnTop,
        showBrandIcon,
        showBrandsUnderCardNumber,
        showInstallmentAmounts: !!showInstallmentAmounts,
        showKCPType,
        showPayButton,
        socialSecurityNumberMode: configuration.socialSecurityNumberMode,
        // callbacks
        onAllValid: !!onAllValid,
        onBinLookup: !!onBinLookup,
        onBinValue: !!onBinValue,
        onBlur: !!onBlur,
        onBrand: !!onBrand,
        onConfigSuccess: !!onConfigSuccess,
        onFieldValid: !!onFieldValid,
        onFocus: !!onFocus,
        onLoad: !!onLoad
    };

    console.log('### utils::getCardConfigData::configData ', configData);

    return configData;
};
