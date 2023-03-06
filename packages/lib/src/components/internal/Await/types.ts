import { ActionHandledReturnObject } from '../../types';

interface StatusObjectProps {
    payload: string;
    resultCode: string;
    type: string;
}

export interface StatusObject {
    type: string;
    props: StatusObjectProps;
}

export interface AwaitComponentProps {
    type: string;
    delay?: number;
    countdownTime: number;
    throttleTime: number;
    showCountdownTimer: boolean;
    throttleInterval: number;
    paymentData: string;
    url?: string;
    classNameModifiers?: string[];
    clientKey: string;
    onError: (error) => void;
    onComplete: (status, component) => void;
    brandLogo: string;
    messageText: string;
    awaitText: string;
    ref: any;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
}
