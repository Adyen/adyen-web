/**
 *
 */
export function resolveEnvironment(env = 'TEST'): google.payments.api.Environment {
    const environment = env.toLowerCase();
    switch (environment) {
        case 'production':
        case 'live':
            return 'PRODUCTION';
        default:
            return 'TEST';
    }
}

export function mapBrands(brands) {
    const brandMapping = {
        mc: 'MASTERCARD',
        amex: 'AMEX',
        visa: 'VISA',
        interac: 'INTERAC',
        discover: 'DISCOVER',
        jcb: 'JCB'
    };
    const allowedCardNetworks = brands.map(brand => brandMapping[brand]);
    return allowedCardNetworks.reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), []);
}
