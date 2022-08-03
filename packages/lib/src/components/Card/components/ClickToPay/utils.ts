import SrcSdkLoader from './services/sdks/SrcSdkLoader';
import ClickToPayService from './services/ClickToPayService';
import { IClickToPayService, IdentityLookupParams } from './services/types';
import { CardConfiguration, ClickToPayConfiguration, ClickToPayScheme } from '../../types';
import { SrcInitParams } from './services/sdks/types';

function createClickToPayService(
    configuration: CardConfiguration,
    clickToPayConfiguration: ClickToPayConfiguration | undefined,
    environment: string
): IClickToPayService | null {
    const schemesConfig = createSchemesInitConfiguration(configuration);

    if (!schemesConfig) {
        return null;
    }

    const shopperIdentity = createShopperIdentityObject(clickToPayConfiguration?.shopperIdentityValue, clickToPayConfiguration?.shopperIdentityType);

    const schemeNames = Object.keys(schemesConfig);
    const srcSdkLoader = new SrcSdkLoader(schemeNames, environment, clickToPayConfiguration?.locale);
    const service = new ClickToPayService(schemesConfig, srcSdkLoader, shopperIdentity);

    return service;
}

const createShopperIdentityObject = (value: string, type?: 'email' | 'mobilePhone'): IdentityLookupParams => {
    if (!value) {
        return null;
    }
    return {
        value,
        type: type || 'email'
    };
};

const createSchemesInitConfiguration = (configuration: CardConfiguration): Record<ClickToPayScheme, SrcInitParams> => {
    if (!configuration) {
        return null;
    }

    const { visaSrciDpaId, visaSrcInitiatorId, mcDpaId, mcSrcClientId } = configuration;

    const schemesConfig: Record<ClickToPayScheme, SrcInitParams> = {
        ...(mcDpaId && mcSrcClientId && { mc: { srciDpaId: mcDpaId, srcInitiatorId: mcSrcClientId } }),
        ...(visaSrciDpaId &&
            visaSrcInitiatorId && {
                visa: {
                    srciDpaId: visaSrciDpaId,
                    srcInitiatorId: visaSrcInitiatorId
                }
            })
    };
    return Object.keys(schemesConfig).length === 0 ? null : schemesConfig;
};

export { createClickToPayService };
