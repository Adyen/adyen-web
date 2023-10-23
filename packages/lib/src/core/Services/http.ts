import { FALLBACK_CONTEXT } from '../config';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

export interface HttpOptions {
    accept?: string;
    contentType?: string;
    errorMessage?: string;
    headers?;
    loadingContext?: string;
    method?: string;
    path: string;
    errorLevel?: ErrorLevel;
}

type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

type AdyenErrorResponse = {
    errorCode: string;
    message: string;
    errorType: string;
    status: number;
};

function isAdyenErrorResponse(data: any): data is AdyenErrorResponse {
    return data && data.errorCode && data.errorType && data.message && data.status;
}

export function http<T>(options: HttpOptions, data?: any): Promise<T> {
    const { headers = [], errorLevel = 'warn', loadingContext = FALLBACK_CONTEXT, method = 'GET', path } = options;

    const request: RequestInit = {
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
    };

    const url = `${loadingContext}${path}`;

    return (
        fetch(url, request)
            .then(async response => {
                const data = await response.json();

                if (response.ok) {
                    return data;
                }

                if (isAdyenErrorResponse(data)) {
                    handleFetchError(data.message, errorLevel);
                    return;
                }

                const errorMessage = options.errorMessage || `Service at ${url} is not available`;
                handleFetchError(errorMessage, errorLevel);
                return;
            })
            /**
             * Catch block handles Network error, CORS error, or exception throw by the `handleFetchError`
             * inside the `then` block
             */
            .catch(error => {
                /**
                 * If error is instance of AdyenCheckoutError, which means that it was already
                 * handled by the `handleFetchError` on the `then` block, then we just throw it.
                 * There is no need to create it again
                 */
                if (error instanceof AdyenCheckoutError) {
                    throw error;
                }

                const errorMessage = options.errorMessage || `Call to ${url} failed. Error= ${error}`;
                handleFetchError(errorMessage, errorLevel);
            })
    );
}

function handleFetchError(message: string, level: ErrorLevel): void {
    switch (level) {
        case 'silent': {
            break;
        }
        case 'info':
        case 'warn':
        case 'error': {
            console[level](message);
            break;
        }
        default:
            throw new AdyenCheckoutError('NETWORK_ERROR', message);
    }
}

export function httpGet<T = any>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'GET' }, data);
}

export function httpPost<T = any>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
