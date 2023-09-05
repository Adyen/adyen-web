import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';

class WeChatPayElement extends QRLoaderContainer {
    public static type = TxVariants.wechatpay;
    public static txVariants = [TxVariants.wechatpay, TxVariants.wechatpayQR];

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default WeChatPayElement;
