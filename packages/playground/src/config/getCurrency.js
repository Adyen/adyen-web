const currencies = {
    AR: 'ARS',
    AU: 'AUD',
    BR: 'BRL',
    CA: 'CAD',
    CH: 'CHF',
    CN: 'CNY',
    CZ: 'CZK',
    DK: 'DKK',
    GB: 'GBP',
    HK: 'HKD',
    HR: 'HRK',
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
    SK: 'SKK',
    TH: 'THB',
    TW: 'TWD',
    US: 'RSD',
    VN: 'VND',
    default: 'RSD'
};

const getCurrency = countryCode => currencies[countryCode] || currencies.default;

export default getCurrency;
