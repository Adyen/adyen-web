import QRLoaderContainer from '../helpers/QRLoaderContainer';

class SwishElement extends QRLoaderContainer {
    public static type = 'swish';

    formatProps(props) {
        return {
            shouldRedirectOnMobile: true,
            STATUS_INTERVAL: 2000, // ms
            COUNTDOWN_MINUTES: 3, // min
            ...super.formatProps(props)
        };
    }
}

export default SwishElement;
