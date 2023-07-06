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

export const getComponentConfiguration = (type: string, componentsConfig = {}, isStoredCard = false) => {
    let pmType = type;
    if (type === 'scheme') {
        pmType = isStoredCard ? 'storedCard' : 'card';
    }

    return componentsConfig[pmType] || {};
};
