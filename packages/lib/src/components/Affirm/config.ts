export const ALLOWED_COUNTRIES = ['CA', 'US', 'GB'] as const;
export const DEFAULT_COUNTRIES: (typeof ALLOWED_COUNTRIES)[number][] = ['CA', 'US'];
