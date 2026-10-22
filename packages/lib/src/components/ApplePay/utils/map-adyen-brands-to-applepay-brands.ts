export const CHINA_UNION_PAY_NETWORK = 'chinaUnionPay';

export function mapBrands(brands: string[]) {
    const brandMapping: Record<string, string> = {
        mc: 'masterCard',
        amex: 'amex',
        visa: 'visa',
        elodebit: 'elo',
        elo: 'elo',
        interac: 'interac',
        discover: 'discover',
        jcb: 'jcb',
        electron: 'electron',
        maestro: 'maestro',
        girocard: 'girocard',
        cartebancaire: 'cartesBancaires',
        eftpos_australia: 'eftpos',
        cup: CHINA_UNION_PAY_NETWORK
    };

    return brands.reduce((accumulator, item) => {
        if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
            accumulator.push(brandMapping[item]);
        }
        return accumulator;
    }, []);
}
