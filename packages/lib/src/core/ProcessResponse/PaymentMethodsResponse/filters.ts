export function filterAllowedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) > -1;
}

export function filterRemovedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) < 0;
}

export function filterEcomStoredPaymentMethods(pm) {
    return !!pm && !!pm.supportedShopperInteractions && pm.supportedShopperInteractions.includes('Ecommerce');
}

const supportedStoredPaymentMethods = [
    'scheme',
    'blik',
    'twint',
    'ach',
    'cashapp',
    'mealVoucher_FR_groupeup',
    'mealVoucher_FR_sodexo',
    'mealVoucher_FR_natixis'
];

export function filterSupportedStoredPaymentMethods(pm) {
    return !!pm && !!pm.type && supportedStoredPaymentMethods.includes(pm.type);
}
