import { ISrcInitiator } from './AbstractSrcInitiator';
import VisaSdk from './VisaSdk';
import MastercardSdk from './MastercardSdk';

const sdkMap = {
    visa: VisaSdk,
    mc: MastercardSdk,
    default: null
};

const getSchemeSdk = (scheme: string, environment: string, locale: string) => {
    const SchemeSdkClass = sdkMap[scheme] || sdkMap.default;
    return SchemeSdkClass ? new SchemeSdkClass(environment, locale) : null;
};

export interface ISrcSdkLoader {
    load(environment: string): Promise<ISrcInitiator[]>;
    schemes: string[];
}

class SrcSdkLoader implements ISrcSdkLoader {
    public readonly schemes: string[];
    private readonly locale: string;

    constructor(schemes: string[], locale = 'en_US') {
        this.schemes = schemes;
        this.locale = locale;
    }

    public async load(environment: string): Promise<ISrcInitiator[]> {
        if (!this.schemes) {
            throw Error('SrcSdkLoader: There are no schemes set to be loaded');
        }

        const sdks = this.schemes.map(scheme => getSchemeSdk(scheme, environment, this.locale));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
