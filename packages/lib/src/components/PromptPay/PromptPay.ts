import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PromptPayElement extends QRLoaderContainer {
    public static type = 'promptpay';

    formatProps(props) {
        return {
            delay,
            countdownTime,
            ...super.formatProps(props)
        };
    }
}

export default PromptPayElement;
