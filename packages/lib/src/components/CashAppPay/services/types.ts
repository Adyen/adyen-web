export interface ICashAppWindowObject {
    pay({ clientId: string }): Promise<ICashAppSDK>;
}

/**
 * https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference
 */
export interface ICashAppSDK {
    render(target: string | HTMLElement, options?: any): Promise<void>;
    addEventListener(event: string, callback: Function): void;
    customerRequest(customerRequest: any): Promise<void>;
    restart(): Promise<void>;
}
