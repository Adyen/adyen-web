import VisaSrcSdk from './sdks/VisaSrcSdk';
import MasterCardSdk from './sdks/MasterCardSdk';

const sdkMap = {
    visa: VisaSrcSdk,
    mastercard: MasterCardSdk,
    default: null
};

const getSchemaSdk = (schema: string, environment: string) => {
    const SchemaSdkClass = sdkMap[schema] || sdkMap.default;
    return SchemaSdkClass ? new SchemaSdkClass(environment) : null;
};

export { getSchemaSdk };
