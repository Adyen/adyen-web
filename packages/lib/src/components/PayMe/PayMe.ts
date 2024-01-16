import QRLoaderContainer from '../helpers/QRLoaderContainer';
import Instructions from './Instructions';

class PayMeElement extends QRLoaderContainer {
    public static type = 'payme';
    private static defaultCountdown = 30; // min
    private static defaultDelay = 2000; // ms

    protected static defaultProps = {
        delay: PayMeElement.defaultDelay,
        countdownTime: PayMeElement.defaultCountdown,
        redirectIntroduction: 'payme.openPayMeApp',
        introduction: 'payme.scanQrCode',
        timeToPay: 'payme.timeToPay',
        buttonLabel: 'payme.redirectButtonLabel',
        instructions: Instructions,
        ...QRLoaderContainer.defaultProps
    };
}

export default PayMeElement;
