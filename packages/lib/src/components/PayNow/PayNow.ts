import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';
import { PayNowIntroduction } from './components/PayNowIntroduction';

class PayNowElement extends QRLoaderContainer {
    public static type = TxVariants.paynow;

    formatProps(props) {
        return {
            introduction: PayNowIntroduction,
            timeToPay: 'payme.timeToPay',
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default PayNowElement;
