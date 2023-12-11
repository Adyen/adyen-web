import QRLoaderContainer from '../helpers/QRLoaderContainer';
import { delay, countdownTime as defaultCountdownTime } from './config';
import Instructions from '../PayMe/Instructions';
import { getTimeDiffInMinutesFromNow } from '../../utils/getTimeDiffInMinutesFromNow';

class WeChatPayElement extends QRLoaderContainer {
    public static type = 'wechatpayQR';

    formatProps(props) {
        return {
            delay,
            redirectIntroduction: 'payme.openPayMeApp',
            introduction: 'payme.scanQrCode',
            timeToPay: 'payme.timeToPay',
            buttonLabel: 'payme.redirectButtonLabel',
            instructions: Instructions,
            ...super.formatProps(props),
            countdownTime: this.getCountDownTime(props)
        };
    }

    getCountDownTime(props): number {
        try {
            const { expiresAt, delay } = props;
            if (expiresAt) {
                return getTimeDiffInMinutesFromNow(expiresAt, delay);
            }
        } catch (e) {
            console.error(e);
            return props.countdownTime ?? defaultCountdownTime;
        }
    }
}

export default WeChatPayElement;
