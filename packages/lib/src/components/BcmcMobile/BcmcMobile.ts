import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { STATUS_INTERVAL, COUNTDOWN_MINUTES } from './config';

class BCMCMobileElement extends QRLoaderContainer {
    public static type = 'bcmc_mobile';

    formatProps(props) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

        return {
            delay: STATUS_INTERVAL,
            countdownTime: COUNTDOWN_MINUTES,
            buttonLabel: isMobile ? 'openApp' : 'generateQRCode',
            ...super.formatProps(props)
        };
    }
}

export default BCMCMobileElement;
