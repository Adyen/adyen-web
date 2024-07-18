import { AnalyticsData, AnalyticsObject, CardConfigData, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_VALIDATION_ERROR_STR, ALLOWED_ANALYTICS_DATA, errorCodeMapping } from './constants';
import uuid from '../../utils/uuid';
import { ERROR_CODES, ERROR_MSG_INCOMPLETE_FIELD } from '../Errors/constants';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_FULL } from '../../components/ThreeDS2/config';
import { CardElementProps } from '../../components/Card/types';
import CardInputDefaultProps from '../../components/Card/components/CardInput/defaultProps';
import { DEFAULT_CARD_GROUP_TYPES } from '../../components/internal/SecuredFields/lib/configuration/constants';
import { notFalsy } from '../../components/internal/SecuredFields/lib/utilities/commonUtils';

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
        ...(aObj.configData && { configData: aObj.configData }),
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

export const getCardConfigData = (cardProps: CardElementProps): CardConfigData => {
    // Extract props from cardProps
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
        showBrandsUnderCardNumber,
        showInstallmentAmounts,
        showPayButton = false, // hard coded default
        styles,
        onAllValid,
        onBinLookup,
        onBinValue,
        onBlur,
        onBrand,
        onConfigSuccess,
        onFieldValid,
        onFocus,
        onLoad
    } = cardProps;

    const dataString = JSON.stringify(CardInputDefaultProps.data);

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
        showBrandsUnderCardNumber,
        showInstallmentAmounts: !!showInstallmentAmounts,
        showKCPType,
        showPayButton,
        socialSecurityNumberMode: configuration?.socialSecurityNumberMode,
        srPanelEnabled,
        srPanelMoveFocus,
        /** callbacks */
        // We need to detect if the merchant themselves has defined these, not if we've set them as a default
        hasOnAllValid: onAllValid !== CardInputDefaultProps.onAllValid,
        hasOnBinLookup: onBinLookup !== CardInputDefaultProps.onBinLookup,
        hasOnBinValue: onBinValue !== CardInputDefaultProps.onBinValue,
        hasOnBlur: onBlur !== CardInputDefaultProps.onBlur,
        hasOnBrand: onBrand !== CardInputDefaultProps.onBrand,
        hasOnConfigSuccess: onConfigSuccess !== CardInputDefaultProps.onConfigSuccess,
        hasOnFieldValid: onFieldValid !== CardInputDefaultProps.onFieldValid,
        hasOnFocus: onFocus !== CardInputDefaultProps.onFocus,
        hasOnLoad: onLoad !== CardInputDefaultProps.onLoad
    };

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
