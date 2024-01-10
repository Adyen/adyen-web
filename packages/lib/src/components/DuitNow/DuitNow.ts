import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class DuitNowElement extends QRLoaderContainer {
    public static type = 'duitnow';

    formatProps(props) {
        return super.formatProps({ delay, countdownTime, ...props });
    }
}

export default DuitNowElement;
