import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { delay, countdownTime } from './config';
import { TxVariants } from '../tx-variants';

class WeChatPayElement extends QRLoaderContainer {
    public static readonly type = TxVariants.wechatpayQR;
    public static readonly txVariants = [TxVariants.wechatpay];

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default WeChatPayElement;
