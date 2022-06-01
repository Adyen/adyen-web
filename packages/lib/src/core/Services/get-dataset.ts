import { httpGet } from './http';

export default function getDataset(name: string, loadingContext, locale?) {
    const options = {
        loadingContext,
        errorLevel: 'warn' as const,
        errorMessage: `Dataset ${name} is not available`,
        path: locale ? `datasets/${name}/${locale}.json` : `datasets/${name}.json`
    };

    return httpGet(options);
}
