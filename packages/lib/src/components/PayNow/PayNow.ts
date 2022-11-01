import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'paynow';

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default WeChatPayElement;
