const brandMapping: Record<string, google.payments.api.CardNetwork> = Object.freeze({
    mc: 'MASTERCARD',
    amex: 'AMEX',
    visa: 'VISA',
    elodebit: 'ELO_DEBIT',
    elo: 'ELO',
    interac: 'INTERAC',
    discover: 'DISCOVER',
    jcb: 'JCB',
    electron: 'ELECTRON',
    maestro: 'MAESTRO'
});

export function mapGooglePayBrands(brands: string[]): google.payments.api.CardNetwork[] {
    const mappedBrands = brands.map(brand => brandMapping[brand]).filter((brand): brand is google.payments.api.CardNetwork => !!brand);
    return [...new Set(mappedBrands)];
}
