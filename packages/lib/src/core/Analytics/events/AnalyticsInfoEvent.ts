import { AbstractAnalyticsEvent, AnalyticsEventCategory } from './AbstractAnalyticsEvent';
import { mapErrorCodesForAnalytics } from '../utils';

import type { CoreConfiguration } from '../../types';
import type { DropinConfiguration } from '../../../components/Dropin/types';

type AnalyticsInfoEventProps = {
    type: InfoEventType;
    component: string;
    target?: UiTarget;
    issuer?: string;
    isExpress?: boolean;
    expressPage?: string;
    isStoredPaymentMethod?: boolean;
    brand?: string;
    validationErrorCode?: string;
    validationErrorMessage?: string;
    configData?: Record<string, any>;
    cdnUrl?: string;
    selectedValue?: string;
    presentedValues?: Array<string>;
};

export enum UiTarget {
    instantPaymentButton = 'instant_payment_button',
    dualBrandButton = 'dual_brand_button',
    fastlaneSignupConsentToggle = 'fastlane_signup_consent_toggle',
    otherPaymentMethodButton = 'otherpaymentmethod_button',
    featuredIssuer = 'featured_issuer',
    list = 'list',
    listSearch = 'list_search',
    qrDownloadButton = 'qr_download_button',
    segmentedControl = 'segmented_control',
    cardNumber = 'card_number',
    expiryDate = 'expiry_date',
    expiryMonth = 'expiry_month',
    expiryYear = 'expiry_year',
    securityCode = 'security_code',
    donationAmountButton = 'donation_amount_button'
}

export enum InfoEventType {
    /** When a UI element is clicked */
    clicked = 'clicked',
    /** When a component is rendered in the browser (e.g. render() method is called) */
    rendered = 'rendered',
    /** When a list item is selected (e.g. issuer list) */
    selected = 'selected',
    /** When there is a validation issue with the input */
    validationError = 'validationError',
    /** When input gets focus */
    focus = 'focus',
    /** When input gets unfocus */
    unfocus = 'unfocus',
    /** When iframe fields are configured */
    configured = 'configured',
    /** When a dropdown list is displayed */
    displayed = 'displayed',
    /** When shopper utilizes an input field to search for values (e.g. issuer list) */
    input = 'input',
    /** When shopper clicks to download the image (e.g. QR code image) */
    download = 'download',
    sdkDownloadInitiated = 'sdkDownloadInitiated',
    sdkDownloadFailed = 'sdkDownloadFailed',
    sdkDownloadAborted = 'sdkDownloadAborted',
    sdkDownloadCompleted = 'sdkDownloadCompleted',
    Initialized = 'initialized',
    LookupStarted = 'lookupStarted',
    LookupUserNotFound = 'lookupUserNotFound',
    OtpStarted = 'otpStarted',
    OtpSucceeded = 'otpSucceeded',
    OtpCanceled = 'otpCanceled',
    OtpFailed = 'otpFailed',
    AddressSelectorClicked = 'addressSelectorClicked',
    AddressSelectorClosed = 'addressSelectorClosed',
    AddressChanged = 'addressChanged'
}

export class AnalyticsInfoEvent extends AbstractAnalyticsEvent {
    /**
     * Analytics event type
     */
    private readonly type: InfoEventType;

    /**
     * Component config data set by the merchant. Sent on 'rendered' events or 'initialized' events
     * @private
     */
    private readonly configData?: Record<string, string | boolean | number | null>;
    private readonly target?: UiTarget;
    private readonly issuer?: string;
    private readonly isExpress?: boolean;
    private readonly expressPage?: string;
    private readonly isStoredPaymentMethod?: boolean;
    private readonly brand?: string;
    private readonly selectedValue?: string;
    private readonly validationErrorCode?: string;
    private readonly validationErrorMessage?: string;
    private readonly presentedValues?: string[];

    /**
     *  Third party script URL's (e.g. Apple Pay)
     */
    public cdnUrl?: string;

    constructor(props: AnalyticsInfoEventProps) {
        super(props.component);

        this.type = props.type;

        if (props.target) this.target = props.target;
        if (props.issuer) this.issuer = props.issuer;
        if (props.isStoredPaymentMethod !== undefined) this.isStoredPaymentMethod = props.isStoredPaymentMethod;
        if (props.isExpress !== undefined) this.isExpress = props.isExpress;
        if (props.expressPage) this.expressPage = props.expressPage;
        if (props.brand) this.brand = props.brand;
        if (props.cdnUrl) this.cdnUrl = props.cdnUrl;
        if (props.selectedValue) this.selectedValue = props.selectedValue;
        if (props.validationErrorCode) this.validationErrorCode = props.validationErrorCode;
        if (props.validationErrorMessage) this.validationErrorMessage = props.validationErrorMessage;
        if (props.presentedValues) this.presentedValues = props.presentedValues;

        if (this.type === InfoEventType.rendered || (this.type === InfoEventType.Initialized && props.configData)) {
            this.configData = this.createAnalyticsConfigData(props?.configData);
        }

        // Some of the more generic validation error codes required combination with target to retrieve a specific code
        if (this.type === InfoEventType.validationError) {
            this.validationErrorCode = mapErrorCodesForAnalytics(this.validationErrorCode, this.target);
        }
    }

    /**
     * Set of properties that must not be included when creating the configData for Analytics
     * @private
     */
    private get configDataExcludedFields(): string[] {
        const DROPIN_FIELDS = ['paymentMethodsConfiguration', 'paymentMethodComponents'] satisfies Array<keyof DropinConfiguration>;

        const CORE_INTERNAL_FIELDS = ['_environmentUrls', 'loadingContext'] satisfies Array<keyof CoreConfiguration>;

        const FIELDS_INJECTED_BY_DROPIN = [
            'elementRef',
            'isDropin',
            'oneClick',
            'storedPaymentMethodId',
            'paymentMethodId',
            'isInstantPayment',
            'type'
        ] satisfies Array<keyof DropinConfiguration>;

        /**
         * TODO: Many unit tests are passing 'modules' as props, which leads to circular structure issue
         * The components must use the 'modules' from the core and not from the props
         */
        const UNIT_TEST_FIELDS = ['modules', 'i18n'];

        return [...DROPIN_FIELDS, ...CORE_INTERNAL_FIELDS, ...FIELDS_INJECTED_BY_DROPIN, ...UNIT_TEST_FIELDS];
    }

    /**
     * Set of fields whose value must be masked (replaced with '<masked>') when creating the configData.
     * These fields either contain merchant credentials, shopper PII, or large objects that would
     * pollute the analytics payload without adding value.
     * @private
     */
    private get configDataMaskedFields(): string[] {
        const PII_FIELDS = ['data', 'holderName', 'shopperEmail', 'email', 'telephoneNumber', 'clickToPayConfiguration'];
        const CORE_FIELDS = ['clientKey', 'session', 'paymentMethodsResponse', 'translations', 'order'] satisfies Array<keyof CoreConfiguration>;

        return [...PII_FIELDS, ...CORE_FIELDS];
    }

    /**
     * Creates a serializable analytics payload from the given config object.
     * Sensitive fields are masked with '<masked>', functions are replaced with '<function>',
     * and objects/arrays are stringified (capped at 128 characters).
     */
    private createAnalyticsConfigData(config: Record<string, any>) {
        if (!config) return {};

        const result: Record<string, string | boolean> = {};

        try {
            for (const [key, value] of Object.entries(config)) {
                if (this.configDataExcludedFields.includes(key)) continue;
                result[key] = this.serializeConfigValue(key, value);
            }
        } catch (error: unknown) {
            if (process.env.NODE_ENV === 'development') console.warn('AnalyticsInfoEvent: Error when creating configData\n', error);
        }

        return result;
    }

    /**
     * Serializes a single config value into an analytics-safe representation.
     * Sensitive fields are masked, functions are replaced with '<function>',
     * and objects/arrays are stringified (capped at 128 characters).
     */
    private serializeConfigValue(key: string, value: unknown): string | boolean {
        const MAX_STRING_LENGTH = 128;

        if (this.configDataMaskedFields.includes(key)) return '<masked>';
        if (typeof value === 'function') return '<function>';
        if (Array.isArray(value)) return value.join(', ').substring(0, MAX_STRING_LENGTH);
        if (typeof value === 'object' && value !== null) {
            try {
                return JSON.stringify(value).substring(0, MAX_STRING_LENGTH);
            } catch {
                return '[object]';
            }
        }
        return value as string | boolean;
    }

    public getEventCategory(): AnalyticsEventCategory {
        return AnalyticsEventCategory.info;
    }
}
