import QRLoaderContainer from '../helpers/QRLoaderContainer';

class SwishElement extends QRLoaderContainer {
    public static type = 'swish';

    formatProps(props) {
        return super.formatProps({
            delay: 2000, // ms
            countdownTime: 3, // min
            instructions: 'swish.pendingMessage',
            ...props
        });
    }
}

export default SwishElement;
