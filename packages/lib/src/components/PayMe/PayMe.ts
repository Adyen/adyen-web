import QRLoaderContainer from '../helpers/QRLoaderContainer';

class PayMeElement extends QRLoaderContainer {
    public static type = 'payme';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            delay: 2000, // ms
            countdownTime: 10, // min
            instructions: 'payme.pendingMessage' //todo: we might need to pass a component to it
        };
    }
}

export default PayMeElement;
