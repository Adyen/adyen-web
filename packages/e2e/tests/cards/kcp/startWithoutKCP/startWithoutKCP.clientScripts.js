/**
 * Set koreanAuthenticationRequired so KCP fields will show if a korean card number is entered
 */
window.cardConfig = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex', 'korean_local_card'],
    configuration: {
        koreanAuthenticationRequired: true
    }
};
