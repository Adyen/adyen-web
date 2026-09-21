import { httpGet } from './http';
import type { DataSet } from './data-set';

export default function getDataset<T = DataSet>(name: string, loadingContext: string, locale?: string): Promise<T> {
    const options = {
        loadingContext,
        errorLevel: 'warn' as const,
        errorMessage: `Dataset ${name} is not available`,
        path: locale ? `datasets/${name}/${locale}.json` : `datasets/${name}.json`
    };

    return httpGet<T>(options);
}
