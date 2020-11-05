import { FALLBACK_CONTEXT } from '../config';

interface FetchJsonDataOptions {
    accept?: string;
    contentType?: string;
    clientKey?: string;
    errorMessage?: string;
    headers?;
    loadingContext?: string;
    method?: string;
    path: string;
    errorLevel?: 'silent' | 'info' | 'warn' | 'error' | 'fatal';
}

function fetchJsonData(options: FetchJsonDataOptions, data?) {
    const { clientKey, errorLevel = 'warn', loadingContext = FALLBACK_CONTEXT, path } = options;
    const method = options.method || (data ? 'POST' : 'GET');

    const request = {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            // NOTE: Remove next line to test old flow
            ...(clientKey && { 'X-Client-Key': clientKey }),
            ...options.headers
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(data && { body: JSON.stringify(data) })
    } as RequestInit;

    // TODO: Delete
    // const url = `${loadingContext}${path}${clientKey ? `?token=${clientKey}` : ''}`;
    const url = `${loadingContext}${path}`;

    return fetch(url, request)
        .then(response => {
            if (response.ok) return response.json();
            const errorMessage = options.errorMessage || `Service at ${url} is not available`;

            return handleFetchError(errorMessage, errorLevel);
        })
        .catch(e => {
            const errorMessage = options.errorMessage || `Call to ${url} failed. Error= ${e}`;
            return handleFetchError(errorMessage, errorLevel);
        });
}

function handleFetchError(message: string, level: string) {
    switch (level) {
        case 'silent':
            return null;
        case 'info':
        case 'warn':
        case 'error':
            return console[level](message);
        default:
            throw new Error(message);
    }
}

export default fetchJsonData;
