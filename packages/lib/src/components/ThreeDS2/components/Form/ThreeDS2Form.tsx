import { Component, h } from 'preact';
import classNames from 'classnames';

interface ThreeDS2FormProps {
    name: string;
    action: string;
    target: string;
    inputName: string;
    inputValue: string;
    onFormSubmit: (w) => void;
}

export default class ThreeDS2Form extends Component<ThreeDS2FormProps> {
    protected formEl;

    componentDidMount() {
        console.log('### ThreeDS2Form::componentDidMount:: mounted:: submitting form name=', this.props.name);
        this.formEl.submit();
        this.props.onFormSubmit(`${this.props.inputName} sent`);
    }

    render({ name, action, target, inputName, inputValue }) {
        console.log('### ThreeDS2Form::render:: name', name);
        console.log('### ThreeDS2Form::render:: action', action);
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
