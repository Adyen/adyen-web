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
    shouldRedirectOnMobile?: boolean;
    classNameModifiers?: string[];
    clientKey: string;
    onError: (error) => void;
    onComplete: (status, component) => void;
    brandLogo: string;
    messageText: string;
    awaitText: string;
    ref: any;
    getI18n?: (key: string, options?) => string; // Should equate to the Language.get method
}
