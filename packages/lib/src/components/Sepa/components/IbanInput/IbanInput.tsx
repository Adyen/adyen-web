import { Component, h, RefObject } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { renderFormField } from '../../../internal/FormFields';
import Field from '../../../internal/FormFields/Field';
import { checkIbanStatus, isValidHolder } from './validate';
import { electronicFormat, formatIban, getIbanPlaceHolder, getNextCursorPosition } from './utils';
import './IbanInput.scss';

interface IbanInputProps {
    holderName?: string;
    placeholders?: any;
    countryCode?: string;
    showPayButton?: any;
    payButton?: any;
    onChange: (data) => void;
}

interface IbanInputState {
    data: any;
    errors: any;
    valid: any;
    status: string;
    isValid: boolean;
    cursor: number;
}
class IbanInput extends Component<IbanInputProps, IbanInputState> {
    private ibanNumber: RefObject<any>;

    constructor(props) {
        super(props);

        this.state = {
            status: 'ready',
            data: {
                'sepa.ownerName': props?.data?.ownerName || '',
                'sepa.ibanNumber': props?.data?.ibanNumber || ''
            },
            isValid: false,
            cursor: 0,
            errors: {},
            valid: {}
        };

        if (this.state.data['sepa.ibanNumber']) {
            const electronicFormatIban = electronicFormat(this.state.data['sepa.ibanNumber']); // example: NL13TEST0123456789
            this.state.data['sepa.ibanNumber'] = formatIban(electronicFormatIban); // example: NL13 TEST 0123 4567 89
        }

        if (this.state.data['sepa.ibanNumber'] || this.state.data['sepa.ownerName']) {
            const holderNameValid = this.props.holderName ? isValidHolder(this.state.data['sepa.ownerName']) : '';
            const ibanValid = this.state.data['sepa.ibanNumber'] ? checkIbanStatus(this.state.data['sepa.ibanNumber']).status === 'valid' : '';
            const isValid = ibanValid && holderNameValid;
            const data = { data: this.state.data, isValid };

            this.props.onChange(data);
        }
    }

    public static defaultProps = {
        onChange: () => {},
        countryCode: null,
        holderName: true,
        placeholders: {}
    };

    setStatus(status) {
        this.setState({ status });
    }

    onChange() {
        const holderNameValid = this.props.holderName ? isValidHolder(this.state.data['sepa.ownerName']) : '';
        const ibanValid = checkIbanStatus(this.state.data['sepa.ibanNumber']).status === 'valid';
        const isValid = ibanValid && holderNameValid;
        const data = { data: this.state.data, isValid };

        this.props.onChange(data);
    }

    public setData = (key, value, cb?) => {
        this.setState(prevState => ({ data: { ...prevState.data, [key]: value } }), cb);
    };

    public setError = (key, value, cb?) => {
        this.setState(prevState => ({ errors: { ...prevState.errors, [key]: value } }), cb);
    };

    public setValid = (key, value, cb?) => {
        this.setState(prevState => ({ valid: { ...prevState.valid, [key]: value } }), cb);
    };

    public handleHolderInput = holder => {
        this.setState(
            prevState => ({ data: { ...prevState.data, 'sepa.ownerName': holder } }),
            () => {
                this.setError('holder', !isValidHolder(this.state.data['sepa.ownerName']));
                this.onChange(); // propagate state
            }
        );
    };

    public handleIbanInput = e => {
        const inputValue = e.target.value;
        const electronicFormatIban = electronicFormat(inputValue); // example: NL13TEST0123456789
        const iban = formatIban(electronicFormatIban); // example: NL13 TEST 0123 4567 89
        const validationStatus = checkIbanStatus(iban).status;

        // calculate cursor's new position
        const cursor = e.target.selectionStart;
        const previousIban = this.state.data['sepa.ibanNumber'];
        const newCursorPosition = getNextCursorPosition(cursor, iban, previousIban);

        this.setState(
            prevState => ({
                data: { ...prevState.data, 'sepa.ibanNumber': iban },
                errors: { ...prevState.errors, iban: validationStatus === 'invalid' ? 'sepaDirectDebit.ibanField.invalid' : null },
                valid: { ...prevState.valid, iban: validationStatus === 'valid' }
            }),
            () => {
                e.target.setSelectionRange(newCursorPosition, newCursorPosition);
                this.onChange();
            }
        );
    };

    public handleIbanBlur = e => {
        const currentIban = e.target.value;

        if (currentIban.length > 0) {
            const validationStatus = checkIbanStatus(currentIban).status;
            this.setError('iban', validationStatus !== 'valid' ? 'sepaDirectDebit.ibanField.invalid' : null);
        }
    };

    showValidation() {
        const validationStatus = checkIbanStatus(this.state.data['sepa.ibanNumber']).status;
        const holderStatus = isValidHolder(this.state.data['sepa.ownerName']);
        this.setError('iban', validationStatus !== 'valid' ? 'sepaDirectDebit.ibanField.invalid' : null);
        this.setError('holder', !holderStatus ? true : null);
    }

    render({ placeholders, countryCode }: IbanInputProps, { data, errors, valid }) {
        const { i18n } = useCoreContext();
        return (
            <div className="adyen-checkout__iban-input">
                {this.props.holderName && (
                    <Field
                        className={'adyen-checkout__field--owner-name'}
                        label={i18n.get('sepa.ownerName')}
                        filled={data['sepa.ownerName'] && data['sepa.ownerName'].length}
                        errorMessage={errors.holder ? i18n.get('creditCard.holderName.invalid') : false}
                    >
                        {renderFormField('text', {
                            name: 'sepa.ownerName',
                            className: 'adyen-checkout__iban-input__owner-name',
                            placeholder: 'ownerName' in placeholders ? placeholders.ownerName : i18n.get('sepaDirectDebit.nameField.placeholder'),
                            value: data['sepa.ownerName'],
                            'aria-invalid': !!this.state.errors.holder,
                            'aria-label': i18n.get('sepa.ownerName'),
                            onInput: e => this.handleHolderInput(e.target.value)
                        })}
                    </Field>
                )}

                <Field
                    className={'adyen-checkout__field--iban-number'}
                    label={i18n.get('sepa.ibanNumber')}
                    errorMessage={errors.iban ? i18n.get(errors.iban) : false}
                    filled={data['sepa.ibanNumber'] && data['sepa.ibanNumber'].length}
                    isValid={valid.iban}
                    onBlur={this.handleIbanBlur}
                >
                    {renderFormField('text', {
                        ref: ref => {
                            this.ibanNumber = ref;
                        },
                        name: 'sepa.ibanNumber',
                        className: 'adyen-checkout__iban-input__iban-number',
                        classNameModifiers: ['large'],
                        placeholder: 'ibanNumber' in placeholders ? placeholders.ibanNumber : getIbanPlaceHolder(countryCode),
                        value: data['sepa.ibanNumber'],
                        onInput: this.handleIbanInput,
                        'aria-invalid': !!this.state.errors.iban,
                        'aria-label': i18n.get('sepa.ibanNumber'),
                        autocorrect: 'off',
                        spellcheck: false
                    })}
                </Field>

                {this.props.showPayButton && this.props.payButton({ status: this.state.status })}
            </div>
        );
    }
}

export default IbanInput;
