import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { TxVariants } from '../tx-variants';
import './Swish.scss';

class SwishElement extends QRLoaderContainer {
    public static type = TxVariants.swish;

    formatProps(props) {
        return {
            delay: 2000, // ms
            countdownTime: 3, // min
            instructions: 'swish.pendingMessage',
            ...super.formatProps(props)
        };
    }
}

export default SwishElement;
