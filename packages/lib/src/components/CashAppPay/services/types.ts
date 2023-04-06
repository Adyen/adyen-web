import { PaymentAmount } from '../../../types';

export interface ICashAppWindowObject {
    pay({ clientId }: { clientId: string }): Promise<ICashAppSDK>;
}

/**
 * https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference
 */
export interface ICashAppSDK {
    render(target: string | HTMLElement, options?: any): Promise<{ begin?: () => void }>;
    addEventListener(eventType: CashAppPayEvents, callback: Function): void;
    removeEventListener(eventType: CashAppPayEvents, callback: Function): void;
    customerRequest(customerRequest: any): Promise<void>;
    restart(): Promise<void>;
}

export enum CashAppPayEvents {
    CustomerDismissed = 'CUSTOMER_DISMISSED',
    CustomerRequestApproved = 'CUSTOMER_REQUEST_APPROVED',
    CustomerRequestDeclined = 'CUSTOMER_REQUEST_DECLINED',
    CustomerRequestFailed = 'CUSTOMER_REQUEST_FAILED'
}

export interface ICashAppService {
    begin(): void;
    initialize(): Promise<void>;
    setStorePaymentMethod(store: boolean): void;
    renderButton(target: HTMLElement): Promise<void>;
    restart(): Promise<void>;
    createCustomerRequest(): Promise<void>;
    subscribeToEvent(eventType: CashAppPayEvents, callback: Function): Function;
}

export type CashAppServiceConfig = {
    useCashAppButtonUi: boolean;
    storePaymentMethod: boolean;
    environment: string;
    clientId: string;
    scopeId: string;
    amount: PaymentAmount;
    referenceId?: string;
    redirectURL?: string;
    button?: {
        shape?: 'semiround' | 'round';
        size?: 'medium' | 'small';
        theme?: 'dark' | 'light';
        width?: 'static' | 'full';
    };
};
