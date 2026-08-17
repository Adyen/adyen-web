import type { EmiIssuerOption, EmiSelection } from './types';

/**
 * @internal
 * Issuers the shopper can actually act on. An issuer without plans would render as an option that
 * cannot be selected, so it is never offered.
 */
export const getSelectableIssuers = (issuers: EmiIssuerOption[]): EmiIssuerOption[] => issuers.filter(issuer => issuer.plans.length > 0);

/**
 * @internal
 * First selectable issuer and its first plan, or `null` when nothing can be selected.
 */
export const getDefaultSelection = (issuers: EmiIssuerOption[]): EmiSelection | null => {
    const [issuer] = getSelectableIssuers(issuers);

    return issuer ? { issuer, plan: issuer.plans[0] } : null;
};

/**
 * @internal
 * Keeps the shopper's choice whenever the new list still holds it — matched on `id`, so a re-created
 * list carrying the same plans preserves the selection — and falls back to the default otherwise.
 * Returns `current` unchanged when the very same objects are still in the list, so a caller can
 * compare by identity to tell a no-op apart from a real change.
 */
export const resolveSelection = (issuers: EmiIssuerOption[], current: EmiSelection | null): EmiSelection | null => {
    if (!current) return getDefaultSelection(issuers);

    const issuer = issuers.find(item => item.id === current.issuer.id);
    const plan = issuer?.plans.find(item => item.id === current.plan.id);

    if (!issuer || !plan) return getDefaultSelection(issuers);

    return issuer === current.issuer && plan === current.plan ? current : { issuer, plan };
};
