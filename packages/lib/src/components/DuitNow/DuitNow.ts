import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PromptPayElement extends QRLoaderContainer {
    public static type = 'duitnow';

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default PromptPayElement;
