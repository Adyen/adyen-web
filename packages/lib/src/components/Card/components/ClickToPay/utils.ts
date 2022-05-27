import SrcSdkLoader from '../../services/sdks/SrcSdkLoader';
import ClickToPayService from '../../services/ClickToPayService';
import { IClickToPayService } from '../../services/types';
import { ClickToPayConfiguration } from '../../types';

function createClickToPayService(configuration: ClickToPayConfiguration, environment: string): IClickToPayService | null {
    if (!configuration) {
        return null;
    }

    const { schemas, shopperIdentity } = configuration;
    const schemaNames = Object.keys(schemas);
    const srcSdkLoader = new SrcSdkLoader(schemaNames, environment);
    const service = new ClickToPayService(schemas, srcSdkLoader, shopperIdentity);

    return service;
}

export { createClickToPayService };
