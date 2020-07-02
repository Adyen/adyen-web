const AMAZON_SIGNATURE_ENDPOINT = 'services/PaymentInitiation/v1/getAmazonSignature';

const FALLBACK_LOCALE_PER_REGION = {
    eu: 'en_GB',
    us: 'en_US'
};

const SUPPORTED_LOCALES_PER_REGION = {
    eu: ['en_GB', 'de_DE', 'fr_FR', 'it_IT', 'es_ES'],
    us: ['en_US']
};

export { AMAZON_SIGNATURE_ENDPOINT, FALLBACK_LOCALE_PER_REGION, SUPPORTED_LOCALES_PER_REGION };
