import QRLoaderContainer from '../helpers/QRLoaderContainer';

class SwishElement extends QRLoaderContainer {
    public static type = 'swish';

    protected static defaultProps = {
        delay: 2000, // ms
        countdownTime: 3, // min
        instructions: 'swish.pendingMessage',
        ...QRLoaderContainer.defaultProps
    };
}

export default SwishElement;
