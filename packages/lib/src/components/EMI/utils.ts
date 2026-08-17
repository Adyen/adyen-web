import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import type { EmiIssuer, EmiOffer, EmiPlansResponse } from './types';

/**
 * @internal
 * The issuers of the plans response, as they arrived — same objects, same field names, same order.
 *
 * Nothing converts the response, so this is also where a `plans` prop the merchant got wrong is named
 * while the stack still points at their integration: without it a typo surfaces as a `TypeError` from
 * inside a Preact render, which is a bad way to learn about one.
 *
 */
export const resolvePlanIssuers = (plans?: EmiPlansResponse): EmiIssuer[] => {
    if (typeof plans === 'string') {
        throw new AdyenCheckoutError(
            'IMPLEMENTATION_ERROR',
            'EMI: the `plans` configuration was provided but of an incorrect type (should be an object but a string was provided). ' +
                'Try JSON.parse("{...}") your /paymentMethods/emi/plans response.'
        );
    }

    if (Array.isArray(plans)) {
        throw new AdyenCheckoutError(
            'IMPLEMENTATION_ERROR',
            'EMI: the `plans` configuration was provided but of an incorrect type (should be an object but an array was provided). ' +
                'Please check you are passing the whole /paymentMethods/emi/plans response.'
        );
    }

    // Advanced flow without plans, and sessions before the plans endpoint ships. `isAvailable()` owns it
    if (!plans) return [];

    if (!Array.isArray(plans.issuers)) {
        console.warn('EMI: the `plans` configuration was provided but carries no `issuers` array. Pass the plans response verbatim.');
        return [];
    }

    return plans.issuers;
};

/** Ties keep the first offer in backend order, so the same response always resolves the same way. */
const higherOffer = (winner: EmiOffer, candidate: EmiOffer): EmiOffer => (candidate.amount.value > winner.amount.value ? candidate : winner);

/**
 * @internal
 * See ADR-0004-emi-plans-data-transformation for the display-offer policy.
 */
export const selectDisplayOffer = (offers: EmiOffer[] = []): EmiOffer | undefined =>
    offers.reduce<EmiOffer | undefined>((winner, candidate) => (winner ? higherOffer(winner, candidate) : candidate), undefined);
