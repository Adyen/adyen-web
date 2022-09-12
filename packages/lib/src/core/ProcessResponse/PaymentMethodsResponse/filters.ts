export function filterAllowedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) > -1;
}

export function filterRemovedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) < 0;
}

export function filterEcomStoredPaymentMethods(pm) {
    return !!pm && !!pm.supportedShopperInteractions && pm.supportedShopperInteractions.includes('Ecommerce');
}

const supportedStoredPaymentMethods = ['scheme', 'blik', 'twint', 'ach'];

export function filterSupportedStoredPaymentMethods(pm) {
    return !!pm && !!pm.type && supportedStoredPaymentMethods.includes(pm.type);
}
