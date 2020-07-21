import { Component, h } from 'preact';
import { getTimeDifference } from './utils';

interface CountdownProps {
    minutesFromNow: number;
    onTick?: (time) => void;
    onCompleted?: () => void;
}

interface CountdownState {
    startTime: Date;
    endTime: Date;
    minutes: string;
    seconds: string;
}

class Countdown extends Component<CountdownProps, CountdownState> {
    constructor(props) {
        super(props);
        const secondsFromNow = this.props.minutesFromNow * 60000;
        const nowTime = new Date().getTime();
        this.state = {
            startTime: new Date(nowTime),
            endTime: new Date(nowTime + secondsFromNow),
            minutes: '-',
            seconds: '-'
        };
    }

    public static defaultProps = {
        onTick: () => {},
        onCompleted: () => {}
    };

    protected interval;

    tick() {
        const newTime = getTimeDifference(this.state.startTime, this.state.endTime);

        if (newTime.completed) {
            this.props.onCompleted();
            return this.clearInterval();
        }

        const time = {
            minutes: newTime.minutes,
            seconds: newTime.seconds,
            percentage: newTime.percentage
        };

        this.setState({ ...time });
        this.props.onTick(time);
        return time;
    }

    clearInterval() {
        clearInterval(this.interval);
        delete this.interval;
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    componentWillUnmount() {
        this.clearInterval();
    }

    render() {
        return (
            <span className="adyen-checkout__countdown">
                <span className="countdown__minutes">{this.state.minutes}</span>
                <span className="countdown__separator">:</span>
                <span className="countdown__seconds">{this.state.seconds}</span>
            </span>
        );
    }
}

export default Countdown;
