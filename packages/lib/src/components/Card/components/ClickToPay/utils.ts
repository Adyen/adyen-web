import SrcSdkLoader from './services/sdks/SrcSdkLoader';
import ClickToPayService from './services/ClickToPayService';
import { IClickToPayService } from './services/types';
import { ClickToPayConfiguration } from '../../types';

function createClickToPayService(configuration: ClickToPayConfiguration, environment: string): IClickToPayService | null {
    if (!configuration) {
        return null;
    }

    const { schemes, shopperIdentity } = configuration;
    const schemeNames = Object.keys(schemes);
    const srcSdkLoader = new SrcSdkLoader(schemeNames, environment);
    const service = new ClickToPayService(schemes, srcSdkLoader, shopperIdentity);

    return service;
}

export { createClickToPayService };
