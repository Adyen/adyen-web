import { ICashAppSDK, ICashAppSdkLoader } from './CashAppSdkLoader';
import { PaymentAmount } from '../../../types';

export interface ICashAppService {
    initialize(target: HTMLElement): Promise<void>;

    // // https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#restart
    restart(): Promise<void>;
    //
    // // https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#customerrequest
    // createCustomerRequest();
    //
    // // https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#addeventlistener
    // subscribeForCustomerInteraction();
    // subscribeForCustomerDismissed();
    // subscribeForCustomerRequestApproved();
    // subscribeForCustomerRequestDeclined();
    // subscribeForCustomerRequestFailed();
}

type CashAppServiceConfig = {
    environment: string;
    clientId: string;
    scopeId: string;
    amount: PaymentAmount; // check when amount is zero if this is undefined
    referenceId?: string;
    button?: {
        shape?: 'semiround' | 'round';
        size?: 'medium' | 'small';
        theme?: 'dark' | 'light';
        width?: 'static' | 'full';
    };
};

class CashAppService implements ICashAppService {
    private readonly sdkLoader: ICashAppSdkLoader;
    private readonly configuration: CashAppServiceConfig;
    private pay: ICashAppSDK;

    constructor(sdkLoader: ICashAppSdkLoader, configuration: CashAppServiceConfig) {
        this.configuration = configuration;
        this.sdkLoader = sdkLoader;
    }

    public async initialize(target: HTMLElement): Promise<void> {
        try {
            const cashApp = await this.sdkLoader.load(this.configuration.environment);
            this.pay = await cashApp.pay({ clientId: this.configuration.clientId });
            await this.pay.render(target, { button: { width: 'full', shape: 'semiround', ...this.configuration.button } });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async restart(): Promise<void> {
        await this.pay.restart();
    }
}

export { CashAppService };
