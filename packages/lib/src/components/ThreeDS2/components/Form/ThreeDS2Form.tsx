import { Component, h } from 'preact';
import classNames from 'classnames';
import { THREEDS2_FULL } from '../../config';
import { ThreeDS2AnalyticsObject } from '../../types';
import { ANALYTICS_ACTION_LOG } from '../../../../core/Analytics/constants';

interface ThreeDS2FormProps {
    name: string;
    action: string;
    target: string;
    inputName: string;
    inputValue: string;
    onSubmitAnalytics: (w) => void;
}

export default class ThreeDS2Form extends Component<ThreeDS2FormProps> {
    protected formEl;

    componentDidMount() {
        this.formEl.submit();
        this.props.onSubmitAnalytics({
            class: ANALYTICS_ACTION_LOG,
            type: THREEDS2_FULL,
            message: `${this.props.inputName} sent`
        } as ThreeDS2AnalyticsObject);
    }

    render({ name, action, target, inputName, inputValue }) {
        return (
            <form
                ref={ref => {
                    this.formEl = ref;
                }}
                method="POST"
                className={classNames(['adyen-checkout__threeds2__form', `adyen-checkout__threeds2__form--${name}`])}
                name={name}
                action={action}
                target={target}
                style={{ display: 'none' }}
            >
                <input name={inputName} value={inputValue} />
            </form>
        );
    }
}
