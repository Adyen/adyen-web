import { ISrcInitiator } from './AbstractSrcInitiator';
import VisaSrcSdk from './VisaSrcSdk';
import MasterCardSdk from './MasterCardSdk';

const sdkMap = {
    visa: VisaSrcSdk,
    mastercard: MasterCardSdk,
    default: null
};

const getSchemaSdk = (schema: string, environment: string) => {
    const SchemaSdkClass = sdkMap[schema] || sdkMap.default;
    return SchemaSdkClass ? new SchemaSdkClass(environment) : null;
};

export interface ISrcSdkLoader {
    load(): Promise<ISrcInitiator[]>;
}

class SrcSdkLoader implements ISrcSdkLoader {
    private readonly schemas: string[];
    private readonly environment: string;

    constructor(schemas: string[], environment: string) {
        this.schemas = schemas; //TODO:  validate schemas first
        this.environment = environment;
    }

    public async load(): Promise<ISrcInitiator[]> {
        // TODO: ideia: return Map<schema, sdk>
        const sdks = this.schemas.map(schema => getSchemaSdk(schema, this.environment));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
