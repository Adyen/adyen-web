import QRLoaderContainer from '../helpers/QRLoaderContainer';
import Instructions from './Instructions';

class PayMeElement extends QRLoaderContainer {
    public static type = 'payme';
    private static defaultCountdown = 10; // min
    private static defaultDelay = 2000; // ms

    private getCountdownTime(props) {
        // The lifeTime ADP has the highest priority, then the frontend config prop: countdownTime. If neither is presented, we use the default one.
        const { lifeTime, countdownTime = PayMeElement.defaultCountdown } = props;
        return lifeTime ?? countdownTime;
    }

    formatProps(props) {
        return {
            delay: PayMeElement.defaultDelay,
            ...super.formatProps(props),
            countdownTime: this.getCountdownTime(props),
            redirectIntroduction: 'payme.openPayMeApp',
            introduction: 'payme.scanQrCode',
            timeToPay: 'payme.timeToPay',
            redirectButtonLabel: 'payme.redirectButtonLabel',
            instructions: Instructions
        };
    }
}

export default PayMeElement;
