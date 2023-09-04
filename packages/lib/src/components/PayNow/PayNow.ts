import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';

class PayNowElement extends QRLoaderContainer {
    public static type = TxVariants.paynow;

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default PayNowElement;
