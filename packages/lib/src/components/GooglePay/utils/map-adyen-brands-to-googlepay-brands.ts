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

export function mapGooglePayBrands(brands: string[], countryCode: string): google.payments.api.CardNetwork[] {
    /**
     * TODO: Remove this once this feature promotes to GA
     * Maestro only works when countryCode=BR . API is not filtering that out, so we need to filter for merchants
     */
    const sanitizedBrands = countryCode === 'BR' ? brands : brands.filter(brand => brand !== 'maestro');

    const mappedBrands = sanitizedBrands.map(brand => brandMapping[brand]).filter((brand): brand is google.payments.api.CardNetwork => !!brand);
    return [...new Set(mappedBrands)];
}
