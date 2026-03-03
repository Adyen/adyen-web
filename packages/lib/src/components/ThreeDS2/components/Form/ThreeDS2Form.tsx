import { Component, h } from 'preact';
import classNames from 'classnames';

interface ThreeDS2FormProps {
    readonly name: string;
    readonly action: string;
    readonly target: string;
    readonly inputName: string;
    readonly inputValue: string;
    readonly onFormSubmit: (msg: string) => void;
}

export default class ThreeDS2Form extends Component<ThreeDS2FormProps> {
    protected formEl;

    componentDidMount() {
        this.formEl.submit();
        this.props.onFormSubmit(`${this.props.inputName} sent`);
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
