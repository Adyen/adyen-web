import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { BALANCE_CHECK_ERRORS } from './types';
import type { AdyenApiErrorResponse } from '../../core/Services/http';
import type { GiftCardBalanceCheckErrorType, GiftCardBrandsConfiguration, KnownBalanceCheckError } from './types';
import type { Placeholders } from './components/types';

const isKnownBalanceCheckError = (value: unknown): value is KnownBalanceCheckError =>
    typeof value === 'string' && (BALANCE_CHECK_ERRORS as readonly string[]).includes(value);

/**
 * Merges the placeholders of a gift card brand over the top-level placeholders, key by key.
 * An empty string set on the brand is kept, so a brand can blank out a top-level placeholder.
 *
 * @param brand - the gift card brand being rendered
 * @param brandsConfiguration - the merchant's per-brand configuration
 * @param placeholders - the top-level placeholders, used for keys the brand does not define
 * @returns the placeholders to send to the secured fields
 */
export const resolvePlaceholders = (
    brand?: string,
    brandsConfiguration?: GiftCardBrandsConfiguration,
    placeholders?: Placeholders
): Placeholders => ({
    ...placeholders,
    ...(brand ? brandsConfiguration?.[brand]?.placeholders : undefined)
});

/**
 * Classifies anything the balance check promise can reject with into a single error type the component knows how to render.
 *
 * @param error - the rejection value from the balance check
 * @returns the error type to display to the shopper
 */
export const resolveBalanceCheckError = (error: unknown): GiftCardBalanceCheckErrorType => {
    // Identifiers thrown by our own checks on a successful response
    if (error instanceof Error && isKnownBalanceCheckError(error.message)) return error.message;

    // The API rejected the card details, so treat it as a bad card number
    if (error instanceof AdyenCheckoutError && (error.cause as AdyenApiErrorResponse)?.errorType === 'validation') return 'card-error';

    // 5xx, network, CORS, timeout, or a merchant calling reject()
    return 'unknown-error';
};
