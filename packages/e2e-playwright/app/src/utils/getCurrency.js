const currencies = {
    AR: 'ARS',
    AU: 'AUD',
    BR: 'BRL',
    CA: 'CAD',
    CH: 'CHF',
    CN: 'CNY',
    DK: 'DKK',
    GB: 'GBP',
    HK: 'HKD',
    HU: 'HUN',
    ID: 'IDR',
    IN: 'INR',
    JP: 'JPY',
    KR: 'KRW',
    MG: 'MGA',
    MX: 'MXN',
    MY: 'MYR',
    NO: 'NOK',
    NZ: 'NZD',
    PH: 'PHP',
    PL: 'PLN',
    RO: 'RON',
    RU: 'RUB',
    SE: 'SEK',
    SG: 'SGD',
    TH: 'THB',
    TW: 'TWD',
    US: 'USD',
    VN: 'VND',
    default: 'EUR'
};

const getCurrency = countryCode => currencies[countryCode] || currencies.default;

export default getCurrency;
