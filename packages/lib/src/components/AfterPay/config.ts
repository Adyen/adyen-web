const ALLOWED_COUNTRIES = ['BE', 'NL'];
const rivertyConsentUrlMap = {
    be: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_en',
        fr: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_fr',
        nl: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_nl'
    },
    nl: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/nl_en',
        nl: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/nl_nl'
    }
};
export { ALLOWED_COUNTRIES, rivertyConsentUrlMap };
