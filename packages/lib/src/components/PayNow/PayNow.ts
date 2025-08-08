import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PayNowElement extends QRLoaderContainer {
    public static type = 'paynow';

    protected static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };
}

export default PayNowElement;
