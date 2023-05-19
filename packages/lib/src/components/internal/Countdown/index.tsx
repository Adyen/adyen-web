import { h } from 'preact';
import { getTimeDifference } from './utils';
import { useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { A11yManager } from './A11yManager';

interface CountdownProps {
    minutesFromNow: number;
    onTick?: (time) => void;
    onCompleted?: () => void;
}

interface CountdownState {
    minutes: string;
    seconds: string;
}

function Countdown({ minutesFromNow, onTick = () => {}, onCompleted = () => {} }: CountdownProps) {
    const secondsFromNow = minutesFromNow * 60000;
    const nowTime = new Date().getTime();
    const startTime = new Date(nowTime);
    const endTime = new Date(nowTime + secondsFromNow);

    const { i18n } = useCoreContext();
    const { srPanel } = useSRPanelContext();
    const a11yManager = useRef(null);
    const [state, setState] = useState<CountdownState>({
        minutes: '-',
        seconds: '-'
    });

    useEffect(() => {
        const tick = () => {
            const { minutes, seconds, percentage, completed } = getTimeDifference(startTime, endTime);
            if (completed) {
                onCompleted();
            }
            const timeLeft = { minutes, seconds, percentage };
            setState(timeLeft);
            onTick(timeLeft);
        };
        a11yManager.current = new A11yManager({ srPanel, i18n });
        const interval = setInterval(tick, 1000);

        return () => {
            clearInterval(interval);
            a11yManager.current.tearDown();
        };
    }, []);

    useEffect(() => {
        a11yManager.current.update(state);
    }, [state]);

    return (
        <span className="adyen-checkout__countdown" role="timer">
            <span className="countdown__minutes">{state.minutes}</span>
            <span className="countdown__separator">:</span>
            <span className="countdown__seconds">{state.seconds}</span>
        </span>
    );
}

export default Countdown;
