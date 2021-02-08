import { httpGet } from './http';

export default function getDataset(name: string, loadingContext, locale) {
    const options = {
        loadingContext,
        errorLevel: 'warn' as const,
        errorMessage: `Dataset ${name} is not available`,
        path: `datasets/${name}/${locale}.json`
    };

    return httpGet(options);
}
