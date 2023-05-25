import { h } from 'preact';
import { getTimeDifference } from './utils';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CountdownProps, CountdownTime } from './types';
import { useCountdownA11yReporter } from './useCountdownA11yReporter';

const calculateStartAndEndTime = (minutesFromNow: number) => {
    const secondsFromNow = minutesFromNow * 60000;
    const nowTime = new Date().getTime();
    return { startTime: new Date(nowTime), endTime: new Date(nowTime + secondsFromNow) };
};

function Countdown({ minutesFromNow, onTick = () => {}, onCompleted = () => {} }: CountdownProps) {
    const startAndEndTime = useRef(calculateStartAndEndTime(minutesFromNow));
    const { startTime, endTime } = startAndEndTime.current;
    const [time, setTime] = useState<CountdownTime>({
        minutes: '-',
        seconds: '-'
    });
    useCountdownA11yReporter(time);

    useEffect(() => {
        const tick = () => {
            const { minutes, seconds, percentage, completed } = getTimeDifference(startTime, endTime);
            if (completed) {
                onCompleted();
            } else {
                const timeLeft = { minutes, seconds, percentage };
                setTime(timeLeft);
                onTick(timeLeft);
            }
        };
        const interval = setInterval(tick, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <span className="adyen-checkout__countdown" role="timer">
            <span className="countdown__minutes">{time.minutes}</span>
            <span className="countdown__separator">:</span>
            <span className="countdown__seconds">{time.seconds}</span>
        </span>
    );
}

export default Countdown;
