import QRLoaderContainer from '../helpers/QRLoaderContainer';
import Instructions from './Instructions';

class PayMeElement extends QRLoaderContainer {
    public static type = 'payme';
    private static defaultCountdown = 10; // min
    private static defaultDelay = 2000; // ms

    formatProps(props) {
        return {
            delay: PayMeElement.defaultDelay,
            countdownTime: PayMeElement.defaultCountdown,
            redirectIntroduction: 'payme.openPayMeApp',
            introduction: 'payme.scanQrCode',
            timeToPay: 'payme.timeToPay',
            buttonLabel: 'payme.redirectButtonLabel',
            instructions: Instructions,
            ...super.formatProps(props)
        };
    }
}

export default PayMeElement;
