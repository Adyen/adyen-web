import { CASHAPPPAY_PROD_SDK, CASHAPPPAY_SANDBOX_SDK } from './config';
import Script from '../../../utils/Script';
import { ICashAppWindowObject } from './types';
import { AnalyticsModule } from '../../../types/global-types';

export interface ICashAppSdkLoader {
    load(environment: string): Promise<ICashAppWindowObject>;
}

class CashAppSdkLoader implements ICashAppSdkLoader {
    private readonly analytics: AnalyticsModule;
    private readonly environment: string;

    constructor({ analytics, environment }: { analytics: AnalyticsModule; environment: string }) {
        this.analytics = analytics;
        this.environment = environment;
    }

    private isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore CashApp is created by the Cash App SDK
        return !!window.CashApp;
    }

    public async load(): Promise<ICashAppWindowObject> {
        const src = this.environment.toLowerCase().includes('live') ? CASHAPPPAY_PROD_SDK : CASHAPPPAY_SANDBOX_SDK;

        if (!this.isSdkIsAvailableOnWindow()) {
            const scriptElement = new Script({
                src,
                component: 'cashapppay',
                analytics: this.analytics
            });

            await scriptElement.load();
        }

        // @ts-ignore CashApp is created by the Cash App SDK
        return window.CashApp;
    }
}

export { CashAppSdkLoader };
