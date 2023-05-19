import { interpolateElement } from '../../../language/utils';

export class A11yManager {
    protected translationKey = 'sr.wechatpay.timetopay';
    protected longTimeout = 3 * 60 * 1000; // 3 minutes
    protected midTimeout = 60 * 1000; // 1 minute
    protected shortTimeout = 30 * 1000; // 30 seconds

    private srPanel;
    private srInterval;
    private i18n;
    private timeout;
    private timeLeft;

    constructor(props) {
        const { srPanel, i18n } = props;
        this.srPanel = srPanel;
        this.i18n = i18n;
        // Force the srPanel to update arialRelevant
        this.srPanel.update({ arialRelevant: 'additions text' });
    }

    public update(time) {
        const { minutes, seconds } = time;
        if (minutes === '-' || seconds === '-') return;

        const minutesLeft = parseInt(minutes, 10);
        const secondsLeft = parseInt(seconds, 10);
        this.timeLeft = { minutes: minutesLeft, seconds: secondsLeft };

        if (minutesLeft > 5 && this.timeout !== this.longTimeout) {
            this.timeout = this.longTimeout;
            this.setInterval(this.timeout);
        }
        if (minutesLeft >= 1 && minutesLeft <= 5 && this.timeout !== this.midTimeout) {
            this.timeout = this.midTimeout;
            this.setInterval(this.timeout);
        }
        if (minutesLeft < 1 && secondsLeft > 0 && this.timeout !== this.shortTimeout) {
            this.timeout = this.shortTimeout;
            this.setInterval(this.timeout);
        }
    }

    public tearDown() {
        this.clearInterval();
        // Reset the srPanel arialRelevant
        this.srPanel.update({ arialRelevant: this.srPanel.constructor['defaultProps'].arialRelevant });
        this.srPanel.setMessages(null);
    }

    private setInterval(timeout) {
        this.clearInterval();
        const setSrMessages = () => {
            this.srPanel.setMessages(null);
            this.srPanel.setMessages(this.getSrMessages(this.timeLeft));
        };
        // To execute immediately
        setSrMessages();
        this.srInterval = setInterval(setSrMessages, timeout);
    }

    private getSrMessages({ minutes, seconds }) {
        const translation = this.i18n.get(this.translationKey);
        const getTimeTranslation = time => (time !== 0 ? translation => `${time} ${translation}` : () => '');
        const fns = [minutes, seconds].map(getTimeTranslation);
        return [interpolateElement(translation, fns).join('')];
    }

    private clearInterval() {
        if (this.srInterval) clearInterval(this.srInterval);
    }
}
