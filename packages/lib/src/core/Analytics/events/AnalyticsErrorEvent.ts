import { AbstractAnalyticsEvent } from './AbstractAnalyticsEvent';
import { ANALYTICS_EVENT } from '../constants';

type AnalyticsErrorEventProps = {
    component: string;
    errorType: ErrorEventType;
    code: string;
    message?: string;
};

export enum ErrorEventType {
    network = 'Network',
    implementation = 'ImplementationError',
    internal = 'Internal',
    apiError = 'ApiError',
    sdkError = 'SdkError',
    thirdParty = 'ThirdParty',
    generic = 'Generic',
    redirect = 'Redirect',
    threeDS2 = 'ThreeDS2'
}

export enum ErrorEventCode {
    REDIRECT = '600',
    /**  Missing 'paymentData' property from threeDS2 action */
    THREEDS2_ACTION_IS_MISSING_PAYMENT_DATA = '700',
    /** Missing 'token' property from threeDS2 action */
    THREEDS2_ACTION_IS_MISSING_TOKEN = '701',
    /** Decoded token is missing a valid threeDSMethodURL property */
    THREEDS2_TOKEN_IS_MISSING_THREEDSMETHODURL = '702',
    /**
     * Decoded token is missing one or more of the following properties:
     *  fingerprint: (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
     *  challenge: (acsTransID | messageVersion | threeDSServerTransID)
     */
    THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS = '703',
    /** Token decoding or parsing has failed. ('not base64', 'malformed URI sequence' or 'Could not JSON parse token') */
    THREEDS2_TOKEN_DECODE_OR_PARSING_FAILED = '704',
    /** 3DS2 process has timed out */
    THREEDS2_TIMEOUT = '705',
    /** Decoded token is missing a valid acsURL property */
    THREEDS2_TOKEN_IS_MISSING_ACSURL = '800',
    /** Challenge has resulted in an error (no transStatus could be retrieved by the backend) */
    THREEDS2_NO_TRANSSTATUS = '801',
    /** callSubmit3DS2Fingerprint has received a response indicating either a "frictionless" flow, or a "refused" response, but without a details object */
    THREEDS2_NO_DETAILS_FOR_FRICTIONLESS_OR_REFUSED = '802',
    /** callSubmit3DS2Fingerprint cannot find a component to handle the action response */
    THREEDS2_NO_COMPONENT_FOR_ACTION = '803',
    /** callSubmit3DS2Fingerprint has received a response indicating a "challenge" but without an action object */
    THREEDS2_NO_ACTION_FOR_CHALLENGE = '804',
    /** The challenge process has happened, an object has been returned, parsed & accepted as legit, but the result prop on that object is either missing or doesn't have a transStatus prop */
    THREEDS2_CHALLENGE_RESOLVED_WITHOUT_RESULT_PROP = '805'
}

export class AnalyticsErrorEvent extends AbstractAnalyticsEvent {
    private readonly errorType: ErrorEventType;
    private readonly code: string;

    private readonly message?: string;

    constructor(props: AnalyticsErrorEventProps) {
        super(props.component);

        this.errorType = props.errorType;
        this.code = props.code;

        if (props.message !== undefined) this.message = props.message;
    }

    public getEventCategory(): string {
        return ANALYTICS_EVENT.error;
    }
}
