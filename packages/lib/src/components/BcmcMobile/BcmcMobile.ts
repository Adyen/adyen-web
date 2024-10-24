import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { STATUS_INTERVAL, COUNTDOWN_MINUTES } from './config';
import { TxVariants } from '../tx-variants';

class BCMCMobileElement extends QRLoaderContainer {
    public static type = TxVariants.bcmc_mobile;
    public static txVariants = [TxVariants.bcmc_mobile, TxVariants.bcmc_mobile_QR];

    formatProps(props) {
        return {
            delay: STATUS_INTERVAL,
            countdownTime: COUNTDOWN_MINUTES,
            timeToPay: 'payme.timeToPay',
            ...super.formatProps(props)
        };
    }
}

export default BCMCMobileElement;
