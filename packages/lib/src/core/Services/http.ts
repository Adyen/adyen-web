import fetch from './fetch';
import { FALLBACK_CONTEXT } from '../config';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

interface HttpOptions {
    accept?: string;
    contentType?: string;
    errorMessage?: string;
    headers?;
    loadingContext?: string;
    method?: string;
    path: string;
    errorLevel?: 'silent' | 'info' | 'warn' | 'error' | 'fatal';
}

export function http(options: HttpOptions, data?): Promise<any> {
    const { headers = [], errorLevel = 'warn', loadingContext = FALLBACK_CONTEXT, method = 'GET', path } = options;

    const request = {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            ...headers
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(data && { body: JSON.stringify(data) })
    } as RequestInit;

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
            throw new AdyenCheckoutError('network', message);
    }
}

export const httpGet = (options: HttpOptions, data?): Promise<any> => http({ ...options, method: 'GET' }, data);
export const httpPost = (options: HttpOptions, data?): Promise<any> => http({ ...options, method: 'POST' }, data);
