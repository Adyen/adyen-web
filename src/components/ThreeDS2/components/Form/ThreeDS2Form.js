import { Component, h } from 'preact';
import classNames from 'classnames';

export default class ThreeDS2Form extends Component {
    componentDidMount() {
        this.formEl.submit();
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
