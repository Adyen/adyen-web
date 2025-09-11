import { h } from 'preact';
import Countdown from '../../Countdown';
import { QRCountdownProps } from '../types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

const QRCountdown = ({ countdownTime, timeToPay, onTick, onCompleted }: QRCountdownProps) => {
    const { i18n } = useCoreContext();

    const timeToPayString = i18n.get(timeToPay).split('%@');

    return (
        <div className="adyen-checkout__qr-loader__countdown">
            {timeToPayString[0]}&nbsp;
            <Countdown minutesFromNow={countdownTime} onTick={onTick} onCompleted={onCompleted} />
            &nbsp;{timeToPayString[1]}
        </div>
    );
};
export default QRCountdown;
