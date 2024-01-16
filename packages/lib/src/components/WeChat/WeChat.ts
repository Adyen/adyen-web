import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'wechatpayQR';

    protected static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };
}

export default WeChatPayElement;
