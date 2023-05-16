// The component knows how to communicate with SR, how to build translation messages
// Listen to the new time minutes and seconds change, knows the timer component state
// If mins > 5, updates the SR every 3 mins
// If 1 < mins <=5, update the SR every 1 min
// If min <=1 && seconds>0, update SR every 30s
// Clear SR every 5 seconds
// Un-mounding will clear all timers

export class A11yManager {
    protected static translationKey = 'sr.wechatpay.timetopay';
    protected static longTimeout = 1000 * 5; // 3 minutes 3 * 1000 * 60;
    protected static midTimeout = 3000; // 1 minutes 1000 * 60;
    protected static shortTimeout = 1000; // 30 seconds 1000 * 30;

    private interval;
    private srPanel;
    private i18n;
    private timeout;
    private timeLeft;

    constructor(props) {
        // todo: make duration configurable
        const { srPanel, i18n } = props;
        this.srPanel = srPanel;
        this.i18n = i18n;
    }

    public update(time) {
        this.timeLeft = time;
        const { minutes: minutesLeft, seconds: secondsLeft } = time;
        if (minutesLeft > 5 && this.timeout !== A11yManager.longTimeout) {
            this.timeout = A11yManager.longTimeout;
            this.setInterval(this.timeout);
        }
        if (minutesLeft >= 1 && minutesLeft <= 5 && this.timeout !== A11yManager.midTimeout) {
            this.timeout = A11yManager.midTimeout;
            this.setInterval(this.timeout);
        }
        if (minutesLeft < 1 && secondsLeft > 0 && this.timeout !== A11yManager.shortTimeout) {
            this.timeout = A11yManager.shortTimeout;
            this.setInterval(this.timeout);
        }
    }

    public tearDown() {
        this.clearInterval();
    }

    private setInterval(timeout) {
        this.clearInterval();

        const setSrMessages = () => {
            this.srPanel.setMessages(this.getSrMessages(this.timeLeft));
        };
        // to execute immediately
        setSrMessages();
        this.interval = setInterval(setSrMessages, timeout);
    }

    private getSrMessages({ minutes, seconds }) {
        const translation = this.i18n.get(A11yManager.translationKey);
        const fns = [minutes, seconds].map(time => translation => `${time} ${translation}`);
        return [this.build(translation, fns).join('')];
    }

    private build(translation, cbFunctions) {
        const matches = translation.split(/%#(.*?)%#/gm);

        return matches.map((term, index) => {
            const indexInFunctionArray = Math.floor(index / 2);
            return index % 2 === 0 ? term : cbFunctions[indexInFunctionArray](term);
        });
    }

    private clearInterval() {
        if (this.interval) clearInterval(this.interval);
    }
}
