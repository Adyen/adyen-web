import SrcSdkLoader from './sdks/SrcSdkLoader';
import ClickToPayService from './ClickToPayService';
import { IClickToPayService, IdentityLookupParams } from './types';
import { SrcInitParams } from './sdks/types';
import { CardConfiguration, ClickToPayConfiguration, ClickToPayScheme } from '../../../types';

/**
 * Creates the Click to Pay service in case the required configuration is provided
 */
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
    const srcSdkLoader = new SrcSdkLoader(schemeNames, {
        dpaLocale: clickToPayConfiguration?.locale,
        dpaPresentationName: clickToPayConfiguration?.merchantDisplayName
    });
    return new ClickToPayService(schemesConfig, srcSdkLoader, environment, shopperIdentity);
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

/**
 * Parses 'configuration' object that comes from the Card payment method config, and try to create the Click to Pay
 * initialization object in case the values are provided.
 */
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
