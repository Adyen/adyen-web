import { AbstractAnalyticsEvent } from './AbstractAnalyticsEvent';
import { mapErrorCodesForAnalytics } from '../utils';

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
    cardNumber = 'card_number'
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
     * Component config data set by the merchant. Sent only in 'rendered' events
     * @private
     */
    private readonly configData?: Record<string, string | boolean>;
    private readonly target?: UiTarget;
    private readonly issuer?: string;
    private readonly isExpress?: boolean;
    private readonly expressPage?: string;
    private readonly isStoredPaymentMethod?: boolean;
    private readonly brand?: string;
    private readonly validationErrorCode?: string;
    private readonly validationErrorMessage?: string;

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
        if (props.validationErrorCode) this.validationErrorCode = props.validationErrorCode;
        if (props.validationErrorMessage) this.validationErrorMessage = props.validationErrorMessage;

        if (this.type === InfoEventType.rendered) {
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
    private get configDataExcludedFields() {
        const DROPIN_FIELDS = ['paymentMethodsConfiguration'];
        const FIELDS_INJECTED_BY_DROPIN = [
            'elementRef',
            'isDropin',
            'oneClick',
            'storedPaymentMethodId',
            'paymentMethodId',
            'isInstantPayment',
            'type'
        ];
        const PII_FIELDS = ['data', 'holderName', 'shopperEmail', 'email', 'telephoneNumber', 'clickToPayConfiguration'];

        /**
         * TODO: Many unit tests are passing 'modules' as props, which leads to circular structure issue
         * The components must use the 'modules' from the core and not from the props
         */
        const UNIT_TEST_FIELDS = ['modules', 'i18n'];

        return [...DROPIN_FIELDS, ...FIELDS_INJECTED_BY_DROPIN, ...PII_FIELDS, ...UNIT_TEST_FIELDS];
    }

    /**
     * Creates a serializable analytics payload from the given config object.
     * Functions are replaced with 'function', and objects/arrays are stringified.
     */
    private createAnalyticsConfigData(config: Record<string, any>) {
        if (!config) return {};

        const MAX_STRING_LENGTH = 128;
        const result = {};

        try {
            for (const [key, value] of Object.entries(config)) {
                if (!this.configDataExcludedFields.includes(key)) {
                    if (typeof value === 'function') {
                        result[key] = 'function';
                    } else if (Array.isArray(value)) {
                        result[key] = value.join(', ').substring(0, MAX_STRING_LENGTH);
                    } else if (typeof value === 'object' && value !== null) {
                        result[key] = JSON.stringify(value).substring(0, MAX_STRING_LENGTH);
                    } else {
                        result[key] = value;
                    }
                }
            }

            return result;
        } catch (error: unknown) {
            if (process.env.NODE_ENV === 'development') console.warn('AnalyticsInfoEvent: Error when creating configData\n', error);
            return result;
        }
    }

    public getEventCategory(): 'info' {
        return 'info';
    }
}
