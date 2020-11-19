/**
 * Set koreanAuthenticationRequired so KCP fields will show if a korean card number is entered
 */
window.cardConfigObj = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex', 'korean_local_card'],
    configuration: {
        koreanAuthenticationRequired: true
    }
};
