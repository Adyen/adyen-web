import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PayNowElement extends QRLoaderContainer {
    public static type = 'paynow';

    formatProps(props) {
        return super.formatProps({ delay, countdownTime, ...props });
    }
}

export default PayNowElement;
