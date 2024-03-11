import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'wechatpayQR';
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
