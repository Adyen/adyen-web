import { CASHAPPPAY_PROD_SDK, CASHAPPPAY_SANDBOX_SDK } from './config';
import Script from '../../../utils/Script';
import { ICashAppWindowObject } from './types';
import { AnalyticsModule } from '../../../types/global-types';

export interface ICashAppSdkLoader {
    load(environment: string, analytics: AnalyticsModule): Promise<ICashAppWindowObject>;
}

class CashAppSdkLoader implements ICashAppSdkLoader {
    private isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore CashApp is created by the Cash App SDK
        return !!window.CashApp;
    }

    public async load(environment: string, analytics: AnalyticsModule): Promise<ICashAppWindowObject> {
        const src = environment.toLowerCase().includes('live') ? CASHAPPPAY_PROD_SDK : CASHAPPPAY_SANDBOX_SDK;

        if (!this.isSdkIsAvailableOnWindow()) {
            const scriptElement = new Script({ src, component: 'cashapppay', analytics });
            await scriptElement.load();
        }

        // @ts-ignore CashApp is created by the Cash App SDK
        return window.CashApp;
    }
}

export { CashAppSdkLoader };
