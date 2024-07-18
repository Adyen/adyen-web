import { AnalyticsObject, CreateAnalyticsObject, CardConfigData, AnalyticsData } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_VALIDATION_ERROR_STR, errorCodeMapping, ALLOWED_ANALYTICS_DATA } from './constants';
import uuid from '../../utils/uuid';
import { digitsOnlyFormatter } from '../../utils/Formatters/formatters';
import { ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../Errors/constants';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_FULL } from '../../components/ThreeDS2/constants';
import { CardConfiguration } from '../../components/Card/types';
import CardDefaultProps from '../../components/Card/components/CardInput/defaultProps';
import { DEFAULT_CARD_GROUP_TYPES } from '../../components/internal/SecuredFields/lib/constants';

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
export const createAnalyticsObject = (aObj: CreateAnalyticsObject): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    id: uuid(),
    /** ERROR */
    ...(aObj.event === 'error' && { code: aObj.code, errorType: aObj.errorType, message: aObj.message }), // error event
    /** LOG */
    ...(aObj.event === 'log' && { type: aObj.type, message: aObj.message }), // log event
    ...(aObj.event === 'log' && (aObj.type === ANALYTICS_ACTION_STR || aObj.type === THREEDS2_FULL) && { subType: aObj.subtype }), // only added if we have a log event of Action type or ThreeDS2
    ...(aObj.event === 'log' && aObj.type === THREEDS2_FULL && { result: aObj.result }), // only added if we have a log event of ThreeDS2 type
    /** INFO */
    ...(aObj.event === 'info' && { type: aObj.type, target: aObj.target }), // info event
    ...(aObj.event === 'info' && aObj.issuer && { issuer: aObj.issuer }), // relates to issuerLists
    ...(aObj.event === 'info' && { isExpress: aObj.isExpress, expressPage: aObj.expressPage }), // relates to Plugins & detecting Express PMs
    ...(aObj.event === 'info' && aObj.isStoredPaymentMethod && { isStoredPaymentMethod: aObj.isStoredPaymentMethod, brand: aObj.brand }), // only added if we have an info event about a storedPM
    ...(aObj.event === 'info' &&
        aObj.type === ANALYTICS_VALIDATION_ERROR_STR && {
            validationErrorCode: mapErrorCodesForAnalytics(aObj.validationErrorCode, aObj.target),
            validationErrorMessage: aObj.validationErrorMessage
        }), // only added if we have an info event describing a validation error
    ...(aObj.configData && { configData: aObj.configData }),
    /** All */
    ...(aObj.metadata && { metadata: aObj.metadata })
});

const mapErrorCodesForAnalytics = (errorCode: string, target: string) => {
    // Some of the more generic error codes required combination with target to retrieve a specific code
    if (errorCode === ERROR_FIELD_REQUIRED || errorCode === ERROR_INVALID_FORMAT_EXPECTS) {
        return errorCodeMapping[`${errorCode}.${target}`] ?? errorCode;
    }

    let errCode = errorCodeMapping[errorCode] ?? errorCode;

    // If errCode isn't now a number - then we just need to remove any non-digits
    // since the correct error code is already contained within the string e.g. securedField related errors
    if (isNaN(Number(errCode))) {
        errCode = digitsOnlyFormatter(errCode);
    }

    return errCode;
};

export const processAnalyticsData = (analyticsData: AnalyticsData): AnalyticsData => {
    return Object.keys(analyticsData).reduce((acc, prop) => {
        if (ALLOWED_ANALYTICS_DATA.includes(prop)) acc[prop] = analyticsData[prop];
        return acc;
    }, {});
};

export const getCardConfigData = (cardProps: CardConfiguration): CardConfigData => {
    // Extract props from cardProps - mostly setting a default value, if prop not found
    const {
        autoFocus = CardDefaultProps.autoFocus,
        billingAddressAllowedCountries = CardDefaultProps.billingAddressAllowedCountries,
        billingAddressMode = CardDefaultProps.billingAddressMode,
        billingAddressRequired = CardDefaultProps.billingAddressRequired,
        billingAddressRequiredFields = CardDefaultProps.billingAddressRequiredFields,
        brands = DEFAULT_CARD_GROUP_TYPES,
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
        showInstallmentAmounts = CardDefaultProps.showInstallmentAmounts,
        showPayButton = false, // hard coded default
        styles,
        onAllValid = false,
        onBinLookup = false,
        onBinValue = false,
        onBlur = false,
        onBrand = false,
        onConfigSuccess = false,
        onEnterKeyPressed = false,
        onFieldValid = false,
        onFocus = false,
        onLoad = false
    } = cardProps;

    const srPanelEnabled = cardProps.modules?.srPanel?.enabled;
    const srPanelMoveFocus = cardProps.modules?.srPanel?.moveFocus;

    const riskEnabled = cardProps.modules?.risk?.enabled;

    const billingAddressModeValue = cardProps.onAddressLookup ? 'lookup' : billingAddressMode;

    let showKCPType: 'none' | 'auto' | 'atStart' = 'none';
    if (configuration?.koreanAuthenticationRequired === true) {
        showKCPType = countryCode?.toLowerCase() === 'kr' ? 'atStart' : 'auto';
    }

    // Probably just for development - in real life we wouldn't expect the number of supported brands to push the endpoint limit on 128 chars
    let brandsStr = JSON.stringify(brands);
    if (brandsStr.length > 128) {
        brandsStr = brandsStr.substring(0, 124) + '...]';
    }

    // @ts-ignore commenting out props until endpoint is ready
    const configData: CardConfigData = {
        autoFocus,
        billingAddressAllowedCountries: JSON.stringify(billingAddressAllowedCountries),
        billingAddressMode: billingAddressModeValue,
        billingAddressRequired,
        billingAddressRequiredFields: JSON.stringify(billingAddressRequiredFields),
        brands: brandsStr,
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
        riskEnabled,
        showBrandIcon,
        showInstallmentAmounts: !!showInstallmentAmounts,
        showKCPType,
        showPayButton,
        socialSecurityNumberMode: configuration.socialSecurityNumberMode,
        srPanelEnabled,
        srPanelMoveFocus,
        /** callbacks */
        hasOnAllValid: !!onAllValid,
        hasOnBinLookup: !!onBinLookup,
        hasOnBinValue: !!onBinValue,
        hasOnBlur: !!onBlur,
        hasOnBrand: !!onBrand,
        hasOnConfigSuccess: !!onConfigSuccess,
        hasOnEnterKeyPressed: !!onEnterKeyPressed,
        hasOnFieldValid: !!onFieldValid,
        hasOnFocus: !!onFocus,
        hasOnLoad: !!onLoad
    };

    console.log('### utils::getCardConfigData:: configData', configData);

    // TODO - keep until endpoint can accept more entries in the configData object (current limit: 32);
    if (Object.keys(configData).length > 32) {
        const strippedConfigData = Object.entries(configData).reduce((acc, [key, value], index) => {
            if (index < 32) {
                acc[key] = value;
            }
            return acc;
        }, {});

        return strippedConfigData as CardConfigData;
    }

    return configData;
};
