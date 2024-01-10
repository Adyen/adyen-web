import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'wechatpayQR';

    public static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };

    /*    formatProps(props) {
        return super.formatProps({ delay, countdownTime, ...props });
    }*/
}

export default WeChatPayElement;
