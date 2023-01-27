import { Component, h, RefObject } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import { checkIbanStatus, isValidHolder } from './validate';
import { electronicFormat, formatIban, getCountryCode, getIbanPlaceHolder, getNextCursorPosition } from './utils';
import Fieldset from '../FormFields/Fieldset';

interface IbanInputProps {
    holderName?: boolean;
    placeholders?: any;
    countryCode?: string;
    showPayButton?: any;
    payButton?: any;
    onChange: (data) => void;
    label: string;
    data: IbanData;
}

interface IbanData {
    ownerName?: string;
    ibanNumber?: string;
    countryCode?: string;
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
                ownerName: props?.data?.ownerName || '',
                ibanNumber: props?.data?.ibanNumber || '',
                countryCode: props?.data?.countryCode || ''
            },
            isValid: false,
            cursor: 0,
            errors: {},
            valid: {}
        };

        if (this.state.data['ibanNumber']) {
            const electronicFormatIban = electronicFormat(this.state.data['ibanNumber']); // example: NL13TEST0123456789
            this.state.data['ibanNumber'] = formatIban(electronicFormatIban); // example: NL13 TEST 0123 4567 89
        }

        if (this.state.data['ibanNumber'] || this.state.data['ownerName']) {
            const holderNameValid = this.props.holderName ? isValidHolder(this.state.data['ownerName']) : '';
            const ibanValid = this.state.data['ibanNumber'] ? checkIbanStatus(this.state.data['ibanNumber']).status === 'valid' : '';
            const isValid = ibanValid && holderNameValid;
            const data = { data: this.state.data, isValid };

            this.props.onChange(data);
        }
    }

    public static defaultProps = {
        onChange: () => {},
        countryCode: null,
        holderName: true,
        placeholders: {},
        label: null
    };

    setStatus(status) {
        this.setState({ status });
    }

    onChange() {
        const holderNameValid = this.props.holderName ? isValidHolder(this.state.data['ownerName']) : true;
        const ibanValid = checkIbanStatus(this.state.data['ibanNumber']).status === 'valid';
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
            prevState => ({ data: { ...prevState.data, ownerName: holder } }),
            () => {
                this.setError('holder', !isValidHolder(this.state.data['ownerName']));
                this.onChange(); // propagate state
            }
        );
    };

    public handleIbanInput = e => {
        const inputValue = e.target.value;
        const electronicFormatIban = electronicFormat(inputValue); // example: NL13TEST0123456789
        const iban = formatIban(electronicFormatIban); // example: NL13 TEST 0123 4567 89
        const validationStatus = checkIbanStatus(iban).status;

        const countryCode = getCountryCode(electronicFormatIban);

        // calculate cursor's new position
        const cursor = e.target.selectionStart;
        const previousIban = this.state.data['ibanNumber'];
        const newCursorPosition = getNextCursorPosition(cursor, iban, previousIban);

        this.setState(
            prevState => ({
                data: { ...prevState.data, ibanNumber: iban, countryCode: countryCode },
                errors: {
                    ...prevState.errors,
                    iban: validationStatus === 'invalid' ? 'sepaDirectDebit.ibanField.invalid' : null
                },
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
        const validationStatus = checkIbanStatus(this.state.data['ibanNumber']).status;
        const holderStatus = isValidHolder(this.state.data['ownerName']);
        this.setError('iban', validationStatus !== 'valid' ? 'sepaDirectDebit.ibanField.invalid' : null);
        this.setError('holder', !holderStatus ? true : null);
    }

    render({ placeholders, countryCode }: IbanInputProps, { data, errors, valid }) {
        const { i18n } = useCoreContext();
        return (
            <Fieldset classNameModifiers={['iban-input']} label={this.props.label}>
                {this.props.holderName && (
                    <Field
                        className={'adyen-checkout__field--owner-name'}
                        label={i18n.get('sepa.ownerName')}
                        filled={data['ownerName'] && data['ownerName'].length}
                        errorMessage={errors.holder ? i18n.get('creditCard.holderName.invalid') : false}
                        dir={'ltr'}
                        i18n={i18n}
                    >
                        {renderFormField('text', {
                            name: 'ownerName',
                            className: 'adyen-checkout__iban-input__owner-name',
                            placeholder: 'ownerName' in placeholders ? placeholders.ownerName : i18n.get('sepaDirectDebit.nameField.placeholder'),
                            value: data['ownerName'],
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
                    filled={data['ibanNumber'] && data['ibanNumber'].length}
                    isValid={valid.iban}
                    onBlur={this.handleIbanBlur}
                    dir={'ltr'}
                    i18n={i18n}
                >
                    {renderFormField('text', {
                        ref: ref => {
                            this.ibanNumber = ref;
                        },
                        name: 'ibanNumber',
                        className: 'adyen-checkout__iban-input__iban-number',
                        classNameModifiers: ['large'],
                        placeholder: 'ibanNumber' in placeholders ? placeholders.ibanNumber : getIbanPlaceHolder(countryCode),
                        value: data['ibanNumber'],
                        onInput: this.handleIbanInput,
                        'aria-invalid': !!this.state.errors.iban,
                        'aria-label': i18n.get('sepa.ibanNumber'),
                        autocorrect: 'off',
                        spellcheck: false
                    })}
                </Field>

                {this.props.showPayButton && this.props.payButton({ status: this.state.status })}
            </Fieldset>
        );
    }
}

export default IbanInput;
