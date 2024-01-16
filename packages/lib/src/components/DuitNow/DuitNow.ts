import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class DuitNowElement extends QRLoaderContainer {
    public static type = 'duitnow';

    protected static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };
}

export default DuitNowElement;
