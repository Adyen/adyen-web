import fetchJsonData from './fetch-json-data';

export default function getDataset(name: string, loadingContext, locale) {
    const options = {
        loadingContext,
        errorLevel: 'warn' as const,
        errorMessage: `Dataset ${name} is not available`,
        path: `datasets/${name}/${locale}.json`
    };

    return fetchJsonData(options);
}
