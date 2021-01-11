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
        discover: 'DISCOVER'
    };
    return brands.reduce((accumulator, item) => {
        if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
            accumulator.push(brandMapping[item]);
        }
        return accumulator;
    }, []);
}
