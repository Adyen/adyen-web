import withQRLoader from '../helpers/withQRLoader';
import * as config from './config';

const isMobile = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

export default withQRLoader({
    type: 'bcmc_mobile',
    shouldRedirectOnMobile: true,
    buttonLabel: isMobile ? 'openApp' : 'generateQRCode',
    ...config
});
