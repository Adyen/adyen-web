import { interpolateElement } from '../../../language/utils';
import { SRPanel } from '../../../core/Errors/SRPanel';
import Language from '../../../language';
import { CountdownTime } from './types';

interface ICountdownA11yService {
    srPanel: SRPanel;
    i18n: Language;
}

export class CountdownA11yReporter {
    protected TRANSLATION_KEY = 'sr.wechatpay.timetopay';
    protected LONG_TIMEOUT = 180000;
    protected MID_TIMEOUT = 60000;
    protected SHORT_TIMEOUT = 30000;

    private readonly srPanel: SRPanel;
    private readonly i18n: Language;
    private srInterval: ReturnType<typeof setInterval>;
    private timeout: number;
    private timeLeft: { minutes; seconds };

    constructor(props: ICountdownA11yService) {
        const { srPanel, i18n } = props;
        this.srPanel = srPanel;
        this.i18n = i18n;
        // Force the srPanel to update ariaRelevant
        this.srPanel.setAriaProps({ 'aria-relevant': 'additions text' });
    }

    public update(time: CountdownTime): void {
        const { minutes, seconds } = time;
        if (minutes === '-' || seconds === '-') return;

        const minutesLeft = parseInt(minutes, 10);
        const secondsLeft = parseInt(seconds, 10);
        this.timeLeft = { minutes: minutesLeft, seconds: secondsLeft };

        if (minutesLeft > 5 && this.timeout !== this.LONG_TIMEOUT) {
            this.timeout = this.LONG_TIMEOUT;
            this.setInterval(this.timeout);
        }
        if (minutesLeft >= 1 && minutesLeft <= 5 && this.timeout !== this.MID_TIMEOUT) {
            this.timeout = this.MID_TIMEOUT;
            this.setInterval(this.timeout);
        }
        if (minutesLeft < 1 && secondsLeft > 0 && this.timeout !== this.SHORT_TIMEOUT) {
            this.timeout = this.SHORT_TIMEOUT;
            this.setInterval(this.timeout);
        }
    }

    public tearDown(): void {
        this.clearInterval();
        // Reset the srPanel ariaRelevant
        this.srPanel.setAriaProps({ 'aria-relevant': 'all' });
        this.srPanel.setMessages(null);
    }

    private setInterval(timeout): void {
        this.clearInterval();
        const setSrMessages = () => {
            this.srPanel.setMessages(null);
            this.srPanel.setMessages(this.getSrMessages(this.timeLeft));
        };
        // To execute immediately
        setSrMessages();
        this.srInterval = setInterval(setSrMessages, timeout);
    }

    private getSrMessages({ minutes, seconds }): Array<string> {
        const translation = this.i18n.get(this.TRANSLATION_KEY);
        const getTimeTranslation = time => (time !== 0 ? translation => `${time} ${translation}` : () => '');
        const fns = [minutes, seconds].map(getTimeTranslation);
        return [interpolateElement(translation, fns).join('')];
    }

    private clearInterval(): void {
        if (this.srInterval) clearInterval(this.srInterval);
    }
}
