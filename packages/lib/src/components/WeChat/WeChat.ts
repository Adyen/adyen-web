import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'wechatpayQR';
    public static analyticsType = 'wechatpayQR'; // Needed for use-case where merchant makes a payment themselves and then calls checkout.createFromAction(action)

    protected static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };
}

export default WeChatPayElement;
