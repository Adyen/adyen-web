import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';

class PromptPayElement extends QRLoaderContainer {
    public static type = TxVariants.promptpay;

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default PromptPayElement;
