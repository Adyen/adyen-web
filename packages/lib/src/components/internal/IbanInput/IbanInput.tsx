import { Component, h, RefObject } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import { checkIbanStatus, isValidHolder } from './validate';
import { electronicFormat, formatIban, getCountryCode, getIbanPlaceHolder, getNextCursorPosition } from './utils';
import Fieldset from '../FormFields/Fieldset';
import { GenericError } from '../../../core/Errors/types';

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

const ibanHolderNameErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'ach.accountHolderNameField.invalid', // TODO create bespoke translation key
    error: 'ach.accountHolderNameField.invalid'
};

const ibanErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'sepaDirectDebit.ibanField.invalid',
    error: 'sepaDirectDebit.ibanField.invalid'
};

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
        const data = { data: this.state.data, isValid, errors: this.state.errors };

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
                const holderStatus = isValidHolder(this.state.data['ownerName']);
                const holderErr =
                    holderStatus != null && !holderStatus // *don't* consider null, i.e. a value that has just been deleted, to be in error
                        ? ibanHolderNameErrorObj
                        : null;

                this.setError('holder', holderErr, this.onChange);
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
                    iban: validationStatus === 'invalid' ? ibanErrorObj : null
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
            this.setError('iban', validationStatus !== 'valid' ? ibanErrorObj : null, this.onChange);
        } else {
            // Empty field is not in error
            this.setError('iban', null, this.onChange);
        }
    };

    showValidation() {
        const validationStatus = checkIbanStatus(this.state.data['ibanNumber']).status;
        const holderStatus = isValidHolder(this.state.data['ownerName']);
        this.setError('iban', validationStatus !== 'valid' ? ibanErrorObj : null);

        const holderErr = !holderStatus // *do* consider null, i.e. an empty field, to be in error
            ? ibanHolderNameErrorObj
            : null;

        this.setError('holder', holderErr, this.onChange); // add callback param to force propagation of state to parent comp
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
                        errorMessage={errors.holder ? i18n.get(errors.holder.error) : false}
                        dir={'ltr'}
                        i18n={i18n}
                        name={'ownerName'}
                    >
                        {renderFormField('text', {
                            name: 'ownerName',
                            className: 'adyen-checkout__iban-input__owner-name',
                            placeholder: 'ownerName' in placeholders ? placeholders.ownerName : i18n.get('sepaDirectDebit.nameField.placeholder'),
                            value: data['ownerName'],
                            'aria-invalid': !!this.state.errors.holder,
                            'aria-label': i18n.get('sepa.ownerName'),
                            onInput: e => this.handleHolderInput(e.target.value),
                            onBlur: e => this.handleHolderInput(e.target.value)
                        })}
                    </Field>
                )}

                <Field
                    className={'adyen-checkout__field--iban-number'}
                    label={i18n.get('sepa.ibanNumber')}
                    errorMessage={errors.iban ? i18n.get(errors.iban.error) : false}
                    filled={data['ibanNumber'] && data['ibanNumber'].length}
                    isValid={valid.iban}
                    onBlur={this.handleIbanBlur}
                    dir={'ltr'}
                    i18n={i18n}
                    name={'ibanNumber'}
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
