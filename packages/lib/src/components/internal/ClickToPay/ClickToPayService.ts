import requestSecureRemoteCommerceInitData from '../../../core/Services/click-to-pay/secure-remote-commerce-init';
import VisaSrcSdk, { ISecureRemoteCommerceSdk } from './VisaSrcSdk';
import MasterCardSdk from './MasterCardSdk';

// const VALID_SCHEMAS = ['visa', 'mastercard'];

const sdkMap = {
    visa: VisaSrcSdk,
    mastercard: MasterCardSdk,
    default: null
};

const getSchemaSdk = (schema: string) => {
    const SchemaSdkClass = sdkMap[schema] || sdkMap.default;
    return SchemaSdkClass ? new SchemaSdkClass() : null;
};

export enum Status {
    Idle = 'Idle',
    Loading = 'Loading',
    NotAvailable = 'NotAvailable',
    AwaitingSignIn = 'AwaitingSignIn',
    Ready = 'Ready'
}

type CallbackStatusSubscriber = (status: Status) => void;

type ShopperIdentity = {
    value: string;
    type: string;
};

class ClickToPayService {
    private schemas: string[];
    private sdks: ISecureRemoteCommerceSdk[];

    private status: Status;
    private statusSubscriber: CallbackStatusSubscriber;

    private readonly shopperIdentity?: ShopperIdentity;

    constructor(schemas: string[], shopperIdentity?: ShopperIdentity) {
        this.schemas = schemas;
        this.sdks = this.schemas.map(getSchemaSdk);
        this.shopperIdentity = shopperIdentity;
        this.status = Status.Idle;
    }

    public async initialize(): Promise<void> {
        this.setStatus(Status.Loading);

        await this.loadSdkScripts();
        const initParams = await this.fetchSrcInitParameters();
        await this.initiateSdks(initParams);

        const isRecognized = await this.recognizeShopper();

        if (isRecognized) {
            // getSrcProfile
        }

        if (!isRecognized && !this.shopperIdentity) {
            this.setStatus(Status.NotAvailable);
        } else {
            const isEnrolled = await this.identifyShopper();

            if (isEnrolled) {
                this.setStatus(Status.AwaitingSignIn);
            } else {
                this.setStatus(Status.NotAvailable);
            }
        }
    }

    public removeSdks() {
        console.log('removing');
        this.sdks.map(sdk => sdk.remove());
    }

    public subscribeOnStatusChange(callback) {
        this.statusSubscriber = callback;
    }

    private setStatus(status: Status) {
        this.status = status;

        if (this.statusSubscriber) {
            this.statusSubscriber(this.status);
        }
    }

    private async loadSdkScripts() {
        const promises = this.sdks.map(sdk => sdk.load());
        return Promise.all(promises);
    }

    private async recognizeShopper(): Promise<boolean> {
        const recognizingPromises = this.sdks.map(sdk => sdk.isRecognized());
        const responses = await Promise.all(recognizingPromises);
        console.log(responses);

        // Say it is recognized only if recognized by all schema.
        const isRecognized = responses.every(data => data.recognized);
        return isRecognized;
    }

    private async identifyShopper() {
        const identifyLookupPromises = this.sdks.map(sdk =>
            sdk.identityLookup({ value: this.shopperIdentity.value, type: this.shopperIdentity.type })
        );
        const responses = await Promise.all(identifyLookupPromises);

        console.log(responses);

        const isShopperEnrolled = responses.every(data => data.consumerPresent);
        return isShopperEnrolled;
    }

    private async initiateSdks(initParams): Promise<void> {
        const initResponsesPromise = initParams.map((initParam, index) => this.sdks[index].init(initParam));
        await Promise.all(initResponsesPromise);
    }

    private async fetchSrcInitParameters() {
        const requestSrcPromises = this.schemas.map(schema => requestSecureRemoteCommerceInitData(schema));
        const responses = await Promise.all(requestSrcPromises);
        return responses;
    }
}

export default ClickToPayService;
