export const DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM = ['cartebancaire', 'bcmc', 'dankort'] as const;

export const DUAL_BRAND_SELECTION_MECHANISM_MAP: Record<string, string> = {
    fr: 'cartebancaire',
    be: 'bcmc',
    dk: 'dankort'
};
