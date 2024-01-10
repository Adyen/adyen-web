import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime } from './config';

class PromptPayElement extends QRLoaderContainer {
    public static type = 'promptpay';

    formatProps(props) {
        return super.formatProps({ delay, countdownTime, ...props });
    }
}

export default PromptPayElement;
