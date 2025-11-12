import { AnalyticsEvent } from './AnalyticsEvent';
import { ANALYTICS_EVENT, ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import { mapErrorCodesForAnalytics } from './utils';

type AnalyticsInfoEventProps = {
    // TODO: This must be of type 'InfoEventType' - Added in next PR's
    type: string;
    target?: string;
    issuer?: string;
    isExpress?: boolean;
    expressPage?: string;
    isStoredPaymentMethod?: boolean;
    brand?: string;
    validationErrorCode?: string;
    validationErrorMessage?: string;
    configData?: Record<string, any>;
    component?: string;
    cdnUrl?: string;
};

export enum InfoEventType {
    clicked = 'clicked',
    rendered = 'rendered',
    validationError = 'validationError',
    /**
     * Third party SDK events
     */
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

export class AnalyticsInfoEvent extends AnalyticsEvent {
    /**
     * Analytics event type
     */
    // TODO: This must be of type 'InfoEventType' - Added in next PR's
    private readonly type: string;

    /**
     * Component config data set by the merchant. Sent only in 'rendered' events
     * @private
     */
    private readonly configData?: Record<string, string | boolean>;
    private readonly target: string;
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
        super();

        this.component = props.component;
        this.type = props.type;

        if (props.target !== undefined) this.target = props.target;
        if (props.target !== undefined) this.target = props.target;
        if (props.issuer !== undefined) this.issuer = props.issuer;
        if (props.isStoredPaymentMethod !== undefined) this.isStoredPaymentMethod = props.isStoredPaymentMethod;
        if (props.isExpress !== undefined) this.isExpress = props.isExpress;
        if (props.expressPage !== undefined) this.expressPage = props.expressPage;
        if (props.brand !== undefined) this.brand = props.brand;
        if (props.cdnUrl !== undefined) this.cdnUrl = props.cdnUrl;
        if (props.validationErrorCode !== undefined) this.validationErrorCode = props.validationErrorCode;
        if (props.validationErrorMessage !== undefined) this.validationErrorMessage = props.validationErrorMessage;

        // @ts-ignore This will be fixed when we fixed the interface of this Component on next PR's
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (this.type === InfoEventType.rendered) {
            this.configData = this.createAnalyticsConfigData(props?.configData);
        }

        // Some of the more generic validation error codes required combination with target to retrieve a specific code
        if (this.type === ANALYTICS_VALIDATION_ERROR_STR) {
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

    public getEventCategory(): string {
        return ANALYTICS_EVENT.info;
    }
}
