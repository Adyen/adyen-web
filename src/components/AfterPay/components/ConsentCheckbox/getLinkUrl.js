const getLinkUrl = (countryCode, languageCode) => {
    if (languageCode === 'en') {
        return 'https://www.afterpay.nl/en/algemeen/pay-with-afterpay/payment-conditions';
    }

    if (countryCode === 'be') {
        return 'https://www.afterpay.be/be/footer/betalen-met-afterpay/betalingsvoorwaarden';
    }
    return 'https://www.afterpay.nl/nl/algemeen/betalen-met-afterpay/betalingsvoorwaarden';
};

export default getLinkUrl;
