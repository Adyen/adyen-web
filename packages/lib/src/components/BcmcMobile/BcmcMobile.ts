import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { STATUS_INTERVAL, COUNTDOWN_MINUTES } from './config';
import { TxVariants } from '../tx-variants';

class BCMCMobileElement extends QRLoaderContainer {
    public static type = TxVariants.bcmc_mobile;
    public static txVariants = [TxVariants.bcmc_mobile, TxVariants.bcmc_mobile_QR];

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
