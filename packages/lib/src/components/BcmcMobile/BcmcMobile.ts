import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { STATUS_INTERVAL, COUNTDOWN_MINUTES } from './config';

class BCMCMobileElement extends QRLoaderContainer {
    public static type = 'bcmc_mobile';
    private static isMobile = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

    protected static defaultProps = {
        delay: STATUS_INTERVAL,
        countdownTime: COUNTDOWN_MINUTES,
        buttonLabel: BCMCMobileElement.isMobile ? 'openApp' : 'generateQRCode',
        ...QRLoaderContainer.defaultProps
    };
}

export default BCMCMobileElement;
