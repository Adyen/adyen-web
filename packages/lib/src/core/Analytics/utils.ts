import {
    CardConfigData,
    AnalyticsData,
    CreateNewAnalyticsEventObject,
    EnhancedAnalyticsObject,
    NewAnalyticsEventObjectInfo,
    NewAnalyticsEventObjectLog,
    NewAnalyticsEventObjectError
} from './types';
import { errorCodeMapping, ALLOWED_ANALYTICS_DATA, ANALYTICS_EVENT } from './constants';
import uuid from '../../utils/uuid';
import { digitsOnlyFormatter } from '../../utils/Formatters/formatters';
import { ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../Errors/constants';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from '../../components/ThreeDS2/constants';
import { CardConfiguration } from '../../components/Card/types';
import CardInputDefaultProps from '../../components/Card/components/CardInput/defaultProps';
import { DEFAULT_CARD_GROUP_TYPES } from '../../components/internal/SecuredFields/lib/constants';
import { notFalsy } from '../../utils/commonUtils';
import { isConfigurationValid as isFastlaneComponentConfigValid } from '../../components/Card/components/Fastlane/utils/validate-configuration';

const MAX_LENGTH = 128;
export const getUTCTimestamp = () => Date.now();

const INVALID_INFO_PROPS = ['code', 'errorType', 'message', 'result', 'subType'];
const INVALID_ERROR_PROPS = [
    'brand',
    'configData',
    'expressPage',
    'isExpress',
    'isStoredPaymentMethod',
    'issuer',
    'result',
    'subType',
    'target',
    'type',
    'validationErrorCode',
    'validationErrorMessage'
];
const INVALID_LOG_PROPS = [
    'brand',
    'code',
    'configData',
    'errorType',
    'expressPage',
    'isExpress',
    'isStoredPaymentMethod',
    'issuer',
    'validationErrorCode',
    'validationErrorMessage'
];

export const createNewAnalyticsEvent = (aObj: CreateNewAnalyticsEventObject): EnhancedAnalyticsObject => {
    /**
     * Create warnings if props that aren't allowed have been defined for specific analytics event.
     * If these props are defined the call to the analytics endpoint will fail, although this isn't a payment critical error, hence we only warn.
     */
    if (aObj.category === ANALYTICS_EVENT.info) {
        const inValidProps = isValidEventObject(aObj, INVALID_INFO_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Info analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    if (aObj.category === ANALYTICS_EVENT.log) {
        const inValidProps = isValidEventObject(aObj, INVALID_LOG_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Log analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    if (aObj.category === ANALYTICS_EVENT.error) {
        const inValidProps = isValidEventObject(aObj, INVALID_ERROR_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Error analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    return {
        timestamp: String(getUTCTimestamp()),
        id: uuid(),
        ...aObj
    } as EnhancedAnalyticsObject;
};

// Guard to ensure certain props are NOT set on an analytics event
const isValidEventObject = (
    obj: NewAnalyticsEventObjectInfo | NewAnalyticsEventObjectLog | NewAnalyticsEventObjectError,
    inValidPropsToCheckArr: string[]
): string[] => {
    // If any of the invalid props are present, push them into a new array
    return inValidPropsToCheckArr.reduce((acc, item) => {
        if (obj[item] !== undefined) {
            acc.push(item);
        }
        return acc;
    }, []);
};

export const mapErrorCodesForAnalytics = (errorCode: string, target: string) => {
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
