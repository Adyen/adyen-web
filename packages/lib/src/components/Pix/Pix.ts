import QRLoaderContainer from '../helpers/QRLoaderContainer';

class PixElement extends QRLoaderContainer {
    public static type = 'pix';

    formatProps(props) {
        return {
            delay: 2000, // ms
            countdownTime: 15, // min
            ...super.formatProps(props)
        };
    }
}

export default PixElement;
