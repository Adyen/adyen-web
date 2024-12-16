import { DEFAULT_HTTP_TIMEOUT, FALLBACK_CONTEXT } from '../config';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

export interface HttpOptions {
    accept?: string;
    contentType?: string;
    headers?;
    loadingContext?: string;
    method?: string;
    path: string;
    timeout?: number;
    errorLevel?: ErrorLevel;
    errorMessage?: string;
    errorCode?: string;
}

interface FetchErrorOptions {
    message?: string;
    level?: ErrorLevel;
    cause?: unknown;
    code?: string;
}

type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

type AdyenApiErrorResponse = {
    errorCode: string;
    message: string;
    errorType: string;
    status: number;
};

function isAdyenApiErrorResponse(data: any): data is AdyenApiErrorResponse {
    return data && data.errorCode && data.errorType && data.message && data.status;
}

export function http<T>(options: HttpOptions, data?: any): Promise<T> {
    const {
        headers = [],
        errorLevel = 'warn',
        errorCode,
        loadingContext = FALLBACK_CONTEXT,
        method = 'GET',
        path,
        timeout = DEFAULT_HTTP_TIMEOUT
    } = options;

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
        ...(AbortSignal?.timeout && { signal: AbortSignal?.timeout(timeout) }),
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

                if (isAdyenApiErrorResponse(data)) {
                    handleFetchError({ message: data.message, level: errorLevel, cause: data, code: errorCode });
                    return;
                }

                const errorMessage = options.errorMessage || `Service at ${url} is not available`;
                handleFetchError({ message: errorMessage, level: errorLevel, cause: data, code: errorCode });
                return;
            })
            /**
             * Catch block handles Network error, CORS error, or exception throw by the `handleFetchError`
             * inside the `then` block
             */
            .catch((error: unknown) => {
                /**
                 * If error is instance of AdyenCheckoutError, which means that it was already
                 * handled by the `handleFetchError` on the `then` block, then we just throw it.
                 * There is no need to create it again
                 */
                if (error instanceof AdyenCheckoutError) {
                    throw error;
                }

                // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions
                const errorMessage = options.errorMessage || `Call to ${url} failed. Error= ${error}`;
                handleFetchError({ message: errorMessage, level: errorLevel, cause: error, code: errorCode });
            })
    );
}

function handleFetchError({ message, level, cause, code }: FetchErrorOptions): void {
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
            throw new AdyenCheckoutError('NETWORK_ERROR', message, { cause, code });
    }
}

export function httpGet<T = any>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'GET' }, data);
}

export function httpPost<T = any>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
