import SrcSdkLoader from '../../services/sdks/SrcSdkLoader';
import ClickToPayService, { IClickToPayService } from '../../services/ClickToPayService';

function createClickToPayService(configuration: any, environment: string): IClickToPayService | null {
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
