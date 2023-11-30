import QRLoaderContainer from '../helpers/QRLoaderContainer';
import Instructions from './Instructions';

class PayMeElement extends QRLoaderContainer {
    public static type = 'payme';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            delay: 2000, // ms
            countdownTime: 10, // min
            redirectIntroduction: 'payme.openPayMeApp',
            introduction: 'payme.scanQrCode',
            timeToPay: 'payme.timeToPay',
            redirectButtonLabel: 'payme.redirectButtonLabel',
            instructions: Instructions
        };
    }
}

export default PayMeElement;
