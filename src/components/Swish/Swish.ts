import QRLoaderContainer from '../helpers/QRLoaderContainer';

class SwishElement extends QRLoaderContainer {
    public static type = 'swish';

    formatProps(props) {
        return {
            shouldRedirectOnMobile: true,
            delay: 2000, // ms
            countdownTime: 15, // min
            ...super.formatProps(props)
        };
    }
}

export default SwishElement;
