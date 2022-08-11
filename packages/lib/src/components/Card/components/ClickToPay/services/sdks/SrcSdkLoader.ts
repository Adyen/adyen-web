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
    load(): Promise<ISrcInitiator[]>;
    schemes: string[];
}

class SrcSdkLoader implements ISrcSdkLoader {
    public readonly schemes: string[];
    private readonly environment: string;
    private readonly locale: string;

    constructor(schemes: string[], environment: string, locale = 'en_US') {
        this.schemes = schemes;
        this.environment = environment;
        this.locale = locale;
    }

    public async load(): Promise<ISrcInitiator[]> {
        if (!this.schemes) {
            throw Error('SrcSdkLoader: There are no schemes set to be loaded');
        }

        const sdks = this.schemes.map(scheme => getSchemeSdk(scheme, this.environment, this.locale));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
