import { Component, h } from 'preact';
import classNames from 'classnames';
import Field from '../FormFields/Field';
import { renderFormField } from '../FormFields';
import { validatePhoneNumber } from './validate';

class PhoneInput extends Component {
    constructor(props) {
        super(props);

        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handlePhoneInput = this.handlePhoneInput.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            data: {
                phonePrefix: this.props.selected,
                phoneNumber: ''
            },
            errors: {}
        };
    }

    static defaultProps = {
        onChange: () => {},
        onValid: () => {},
        phoneName: 'phoneNumber',
        prefixName: 'phonePrefix',
        selected: null,
        minLength: 3
    };

    onChange() {
        const isPrefixValid = this.props.items ? !!this.state.data.phonePrefix : true;
        const isPhoneNumberValid = validatePhoneNumber(this.state.data.phoneNumber, this.props.minLength);
        const isValid = isPrefixValid && isPhoneNumberValid;

        this.setState({ isValid }, () => {
            this.props.onChange(this.state);
        });
    }

    handlePhoneInput(e) {
        e.preventDefault();
        const phoneNumber = e.target.value;
        const isPhoneNumberValid = validatePhoneNumber(phoneNumber, this.props.minLength);

        this.setState(
            prevState => ({
                data: { ...prevState.data, phoneNumber },
                errors: { ...prevState.errors, phoneNumber: !isPhoneNumberValid }
            }),
            this.onChange
        );
    }

    handlePrefixChange(e) {
        e.preventDefault();
        const phonePrefix = e.currentTarget.getAttribute('data-value');
        const isPrefixValid = !!phonePrefix;

        this.setState(
            prevState => ({
                data: { ...prevState.data, phonePrefix },
                ...(isPrefixValid && { errors: { ...prevState.errors, phonePrefix: false } })
            }),
            this.onChange
        );
    }

    showValidation = () => {
        const isPrefixValid = this.props.items && this.props.items.length ? !!this.state.data.phonePrefix : true;
        const isPhoneNumberValid = validatePhoneNumber(this.state.data.phoneNumber, this.props.minLength);

        this.setState({
            errors: {
                phoneNumber: !isPhoneNumberValid,
                phonePrefix: !isPrefixValid
            }
        });
    };

    render({ items, i18n }) {
        const showPrefix = !!items && items.length;

        return (
            <div className="adyen-checkout__phone-input">
                <div className="adyen-checkout__phone-input__container adyen-checkout__field-group">
                    {!!showPrefix && (
                        <Field
                            errorMessage={!!this.state.errors.phonePrefix}
                            label={i18n.get('infix')}
                            className={classNames({
                                'adyen-checkout__phone-input__prefix': true,
                                'adyen-checkout__field--col-30': true
                            })}
                        >
                            {renderFormField('select', {
                                className: 'adyen-checkout__dropdown--small',
                                items,
                                name: this.props.prefixName,
                                onChange: this.handlePrefixChange,
                                placeholder: i18n.get('infix'),
                                selected: this.state.data.phonePrefix
                            })}
                        </Field>
                    )}

                    <Field
                        errorMessage={!!this.state.errors.phoneNumber}
                        label={i18n.get('telephoneNumber')}
                        className={classNames({
                            'adyen-checkout__input--phone-number': true,
                            'adyen-checkout__field--col-70': showPrefix
                        })}
                    >
                        <input
                            type="tel"
                            name={this.props.phoneName}
                            value={this.state.data.phoneNumber}
                            onInput={this.handlePhoneInput}
                            placeholder="123 456 789"
                            className="adyen-checkout__input"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </Field>
                </div>

                {this.props.showPayButton && this.props.payButton()}
            </div>
        );
    }
}

export default PhoneInput;
