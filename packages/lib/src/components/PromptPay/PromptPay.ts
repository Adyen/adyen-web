import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PromptPayElement extends QRLoaderContainer {
    public static type = 'promptpay';

    protected static defaultProps = {
        countdownTime,
        delay,
        ...QRLoaderContainer.defaultProps
    };
}

export default PromptPayElement;
