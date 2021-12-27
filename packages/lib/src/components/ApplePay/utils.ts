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
        discover: 'discover',
        electron: 'electron',
        elo: 'elo',
        elodebit: 'elo',
        girocard: 'girocard',
        interac: 'interac',
        jcb: 'jcb',
        mada: 'mada',
        mada_Card: 'mada',
        maestro: 'maestro',
        mc: 'masterCard',
        visa: 'visa'
    };

    return brands.reduce((accumulator, item) => {
        if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
            accumulator.push(brandMapping[item]);
        }
        return accumulator;
    }, []);
}
