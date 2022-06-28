import { ISrcInitiator } from './AbstractSrcInitiator';
import VisaSdk from './VisaSdk';
import MastercardSdk from './MastercardSdk';

const sdkMap = {
    visa: VisaSdk,
    mc: MastercardSdk,
    default: null
};

const getSchemeSdk = (scheme: string, environment: string) => {
    const SchemeSdkClass = sdkMap[scheme] || sdkMap.default;
    return SchemeSdkClass ? new SchemeSdkClass(environment) : null;
};

const validateSchemeNames = (schemes: string[]): string[] => {
    const validNames = Object.keys(sdkMap);
    return schemes.reduce((memo, scheme) => {
        if (!validNames.includes(scheme)) {
            console.warn(`SrcSdkLoader: '${scheme}' is not a valid name`);
            return memo;
        }
        return [...memo, scheme];
    }, []);
};

export interface ISrcSdkLoader {
    load(): Promise<ISrcInitiator[]>;
}

class SrcSdkLoader implements ISrcSdkLoader {
    private readonly schemes: string[];
    private readonly environment: string;

    constructor(schemes: string[], environment: string) {
        this.schemes = validateSchemeNames(schemes);
        this.environment = environment;
    }

    public async load(): Promise<ISrcInitiator[]> {
        if (!this.schemes) {
            throw Error('SrcSdkLoader: There are no schemes set to be loaded');
        }

        const sdks = this.schemes.map(scheme => getSchemeSdk(scheme, this.environment));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
