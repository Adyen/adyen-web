import withQRLoader from '../helpers/withQRLoader';

export default withQRLoader({
    type: 'swish',
    shouldRedirectOnMobile: true,
    STATUS_INTERVAL: 2000, // ms
    COUNTDOWN_MINUTES: 3 // min
});
