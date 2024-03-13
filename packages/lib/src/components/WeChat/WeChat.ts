import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';

class WeChatPayElement extends QRLoaderContainer {
    public static type = TxVariants.wechatpayQR;
    public static txVariants = [TxVariants.wechatpay];
    public static analyticsType = 'wechatpayQR'; // Needed for use-case where merchant makes a payment themselves and then calls checkout.createFromAction(action)

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default WeChatPayElement;
