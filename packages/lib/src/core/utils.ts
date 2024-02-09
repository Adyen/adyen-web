import { GENERIC_OPTIONS } from './config';

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */
export function processGlobalOptions(globalOptions) {
    return Object.keys(globalOptions).reduce((r, e) => {
        if (GENERIC_OPTIONS.includes(e)) r[e] = globalOptions[e];
        return r;
    }, {});
}

export function getDefaultPropsByCountryCode(countryCode: string): Record<string, any> {
    switch (countryCode) {
        // Finnish regulations state that no payment method can be open by default
        case 'FI':
            return {
                openFirstPaymentMethod: false,
                openFirstStoredPaymentMethod: false
            };
        default:
            return {};
    }
}
