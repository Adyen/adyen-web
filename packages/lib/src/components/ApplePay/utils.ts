export function resolveSupportedVersion(latestVersion) {
    const versions = [];
    for (let i = latestVersion; i > 0; i--) {
        versions.push(i);
    }

    return versions.find(v => v && window.ApplePaySession && ApplePaySession.supportsVersion(v));
}

export function mapBrands(brands) {
    const brandMapping = {
        amex: 'amex',
        cartebancaire: 'cartesBancaires',
        chinaUnionPay: 'chinaUnionPay', // new
        discover: 'discover',
        eftpos: 'eftpos', // new
        electron: 'electron',
        elo: 'elo',
        elodebit: 'elo',
        girocard: 'girocard',
        interac: 'interac',
        jcb: 'jcb',
        mada: 'mada', // new
        maestro: 'maestro',
        mc: 'masterCard',
        mir: 'mir', // new
        privateLabel: 'privateLabel', // new
        visa: 'visa',
        vPay: 'vPay' // new
    };

    return brands.reduce((accumulator, item) => {
        if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
            accumulator.push(brandMapping[item]);
        }
        return accumulator;
    }, []);
}
