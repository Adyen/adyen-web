import { ISrcInitiator } from './AbstractSrcInitiator';
import VisaSdk from './VisaSdk';
import MastercardSdk from './MastercardSdk';
import { CustomSdkConfiguration } from './types';

const sdkMap = {
    visa: VisaSdk,
    mc: MastercardSdk,
    default: null
};

const getSchemeSdk = (scheme: string, environment: string, customConfig: CustomSdkConfiguration) => {
    const SchemeSdkClass = sdkMap[scheme] || sdkMap.default;
    return SchemeSdkClass ? new SchemeSdkClass(environment, customConfig) : null;
};

export interface ISrcSdkLoader {
    load(environment: string): Promise<ISrcInitiator[]>;
    schemes: string[];
}

class SrcSdkLoader implements ISrcSdkLoader {
    public readonly schemes: string[];
    private readonly customSdkConfiguration: CustomSdkConfiguration;

    constructor(schemes: string[], { dpaLocale = 'en_US', dpaPresentationName = '' }) {
        this.schemes = schemes;
        this.customSdkConfiguration = { dpaLocale, dpaPresentationName };
    }

    public async load(environment: string): Promise<ISrcInitiator[]> {
        if (!this.schemes) {
            throw Error('SrcSdkLoader: There are no schemes set to be loaded');
        }

        const sdks = this.schemes.map(scheme => getSchemeSdk(scheme, environment, this.customSdkConfiguration));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
