import { ISrcInitiator } from './AbstractSrcInitiator';
import VisaSdk from './VisaSdk';
import MastercardSdk from './MastercardSdk';
import { CustomSdkConfiguration } from './types';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';
import { isFulfilled, isRejected } from '../../../../../utils/promise-util';
import { AnalyticsModule } from '../../../../../types/global-types';

const sdkMap: Record<string, typeof VisaSdk | typeof MastercardSdk | null> = {
    visa: VisaSdk,
    mc: MastercardSdk,
    default: null
};

const getSchemeSdk = (scheme: string, environment: string, customConfig: CustomSdkConfiguration): ISrcInitiator | null => {
    const SchemeSdkClass = sdkMap[scheme] || sdkMap.default;
    return SchemeSdkClass ? new SchemeSdkClass(environment, customConfig) : null;
};

export interface ISrcSdkLoader {
    load(environment: string, analytics: AnalyticsModule): Promise<ISrcInitiator[]>;
    schemes: string[];
}

class SrcSdkLoader implements ISrcSdkLoader {
    public readonly schemes: string[];

    private readonly customSdkConfiguration: CustomSdkConfiguration;

    constructor(schemes: string[], { dpaLocale = 'en_US', dpaPresentationName = '' }) {
        this.schemes = schemes;
        this.customSdkConfiguration = { dpaLocale, dpaPresentationName };
    }

    public async load(environment: string, analytics: AnalyticsModule): Promise<ISrcInitiator[]> {
        if (!this.schemes || this.schemes.length === 0) {
            throw new AdyenCheckoutError('ERROR', 'ClickToPay -> SrcSdkLoader: There are no schemes set to be loaded');
        }

        return new Promise((resolve, reject) => {
            const sdks: ISrcInitiator[] = this.schemes.map(scheme => getSchemeSdk(scheme, environment, this.customSdkConfiguration));
            const loadScriptPromises = sdks.map(sdk => sdk.loadSdkScript(analytics));

            void Promise.allSettled(loadScriptPromises).then(loadScriptResponses => {
                if (loadScriptResponses.every(isRejected)) {
                    reject(
                        new AdyenCheckoutError('ERROR', `ClickToPay -> SrcSdkLoader # Unable to load network schemes: ${this.schemes.toString()}`)
                    );
                }

                const sdksLoaded = sdks.filter((sdk, index) => isFulfilled(loadScriptResponses[index]));

                resolve(sdksLoaded);
            });
        });
    }
}

export default SrcSdkLoader;
