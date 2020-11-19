/**
 * Set koreanAuthenticationRequired & countryCode so KCP fields show at start
 */
window.cardConfigObj = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex', 'korean_local_card'],
    configuration: {
        koreanAuthenticationRequired: true
    },
    countryCode: 'kr'
};
