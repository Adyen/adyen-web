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

const validateSchemaNames = (schemas: string[]): string[] => {
    const validNames = Object.keys(sdkMap);
    return schemas.reduce((memo, schema) => {
        if (!validNames.includes(schema)) {
            console.warn(`SrcSdkLoader: '${schema}' is not a valid name`);
            return memo;
        }
        return [...memo, schema];
    }, []);
};

export interface ISrcSdkLoader {
    load(): Promise<ISrcInitiator[]>;
}

class SrcSdkLoader implements ISrcSdkLoader {
    private readonly schemas: string[];
    private readonly environment: string;

    constructor(schemas: string[], environment: string) {
        this.schemas = validateSchemaNames(schemas);
        this.environment = environment;
    }

    public async load(): Promise<ISrcInitiator[]> {
        if (!this.schemas) {
            throw Error('SrcSdkLoader: There are no schemas set to be loaded');
        }

        const sdks = this.schemas.map(schema => getSchemaSdk(schema, this.environment));
        const promises = sdks.map(sdk => sdk.loadSdkScript());
        await Promise.all(promises);
        return sdks;
    }
}

export default SrcSdkLoader;
