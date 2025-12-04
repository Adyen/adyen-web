import { AbstractAnalyticsEvent, AnalyticsEventCategory } from './AbstractAnalyticsEvent';
import type { PaymentAction } from '../../../types/global-types';

type AnalyticsLogEventProps = {
    type: LogEventType;
    subType?: LogEventSubtype;
    component: string;
    message: string;
    result?: string;
};

export enum LogEventType {
    action = 'action',
    submit = 'submit',
    redirect = 'redirect',
    threeDS2 = 'threeDS2',
    closed = 'closed'
}

export enum LogEventSubtype {
    challengeIframeLoaded = 'challengeIframeLoaded',
    challengeDataSentWeb = 'challengeDataSentWeb',
    challengeCompleted = 'challengeCompleted',
    fingerprintDataSentWeb = 'fingerprintDataSentWeb',
    fingerprintCompleted = 'fingerprintCompleted',
    fingerprintIframeLoaded = 'fingerprintIframeLoaded',
    threeDS2 = 'threeDS2',
    redirect = 'redirect',
    voucher = 'voucher',
    await = 'awat',
    qrCode = 'qrCode',
    bankTransfer = 'bankTransfer',
    sdk = 'sdk'
}

export class AnalyticsLogEvent extends AbstractAnalyticsEvent {
    private readonly type: LogEventType;
    private readonly subType: LogEventSubtype;

    private readonly message?: string;
    private readonly result?: string;

    constructor(props: AnalyticsLogEventProps) {
        super(props.component);

        this.type = props.type;
        this.message = props.message;

        if (props.subType) this.subType = props.subType;
        if (props.result) this.result = props.result;
    }

    public getEventCategory(): AnalyticsEventCategory {
        return AnalyticsEventCategory.log;
    }

    public static getSubtypeFromActionType(type: PaymentAction['type']): LogEventSubtype {
        return LogEventSubtype[type];
    }
}
