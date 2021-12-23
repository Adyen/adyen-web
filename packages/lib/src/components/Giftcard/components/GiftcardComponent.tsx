import { Component, h } from 'preact';
import classNames from 'classnames';
import SecuredFieldsProvider from '../../../components/internal/SecuredFields/SecuredFieldsProvider';
import Field from '../../internal/FormFields/Field';
import Alert from '../../internal/Alert';
import GiftcardResult from './GiftcardResult';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PaymentAmount } from '../../../types';
import { GIFT_CARD } from '../../internal/SecuredFields/lib/configuration/constants';
import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import styles from '../../Card/components/CardInput/CardInput.module.scss';

interface GiftcardComponentProps {
    onChange: (state) => void;
    onFocus: (event) => void;
    onBlur: (event) => void;
    onSubmit: (event) => void;
    onBalanceCheck: (event) => void;

    amount: PaymentAmount;
    showPayButton?: boolean;
    payButton: (config) => any;

    pinRequired: boolean;
    expiryDateRequired?: boolean;
}

class Giftcard extends Component<GiftcardComponentProps> {
    public state = {
        status: 'ready',
        data: {},
        balance: null,
        transactionLimit: null,
        focusedElement: false,
        isValid: false
    };

    public static defaultProps = {
        pinRequired: true,
        expiryDateRequired: false,
        onChange: () => {},
        onFocus: () => {},
        onBlur: () => {}
    };

    public sfp;

    public onChange = sfpState => {
        this.props.onChange({
            data: sfpState.data,
            isValid: sfpState.isSfpValid
        });
    };

    public showValidation = () => {
        this.sfp.showValidation();
    };

    setStatus(status) {
        this.setState({ status });
    }

    public handleFocus = e => {
        this.setState({ focusedElement: e.currentFocusObject });

        const isFocused = e.focus === true;
        if (isFocused) {
            this.props.onFocus(e);
        } else {
            this.props.onBlur(e);
        }
    };

    public setBalance = ({ balance, transactionLimit }) => {
        this.setState({ balance, transactionLimit });
    };

    render(props, { focusedElement, balance, transactionLimit }) {
        const { i18n } = useCoreContext();

        const transactionAmount = transactionLimit?.value < balance?.value ? transactionLimit : balance;
        const hasEnoughBalance = transactionAmount?.value >= this.props.amount?.value;

        if (transactionAmount && hasEnoughBalance) {
            return <GiftcardResult balance={balance} transactionLimit={transactionLimit} onSubmit={props.onSubmit} {...props} />;
        }

        const getCardErrorMessage = sfpState => {
            if (sfpState.errors.encryptedCardNumber) return i18n.get('error.va.gen.01');

            switch (this.state.status) {
                case 'no-balance':
                    return i18n.get('error.giftcard.no-balance');
                case 'card-error':
                    return i18n.get('error.giftcard.card-error');
                case 'currency-error':
                    return i18n.get('error.giftcard.currency-error');
                default:
                    return null;
            }
        };

        return (
            <div className="adyen-checkout__giftcard">
                {this.state.status === 'error' && <Alert icon={'cross'}>{i18n.get('error.message.unknown')}</Alert>}

                <SecuredFieldsProvider
                    {...this.props}
                    ref={ref => {
                        this.sfp = ref;
                    }}
                    onChange={this.onChange}
                    onFocus={this.handleFocus}
                    type={GIFT_CARD}
                    render={({ setRootNode, setFocusOn }, sfpState) => (
                        <div ref={setRootNode} className="adyen-checkout__field-wrapper">
                            <Field
                                label={i18n.get('creditCard.numberField.title')}
                                classNameModifiers={['number', ...(props.pinRequired && !props.expiryDateRequired ? ['70'] : ['100'])]}
                                errorMessage={getCardErrorMessage(sfpState)}
                                focused={focusedElement === 'encryptedCardNumber'}
                                onFocusField={() => setFocusOn('encryptedCardNumber')}
                                dir={'ltr'}
                                name={'encryptedCardNumber'}
                            >
                                <DataSfSpan
                                    encryptedFieldType="encryptedCardNumber"
                                    data-info='{"length":"15-32", "maskInterval":4}'
                                    className={classNames({
                                        'adyen-checkout__input': true,
                                        'adyen-checkout__input--large': true,
                                        'adyen-checkout__card__cardNumber__input': true,
                                        'adyen-checkout__input--error': getCardErrorMessage(sfpState),
                                        'adyen-checkout__input--focus': focusedElement === 'encryptedCardNumber'
                                    })}
                                />
                            </Field>

                            {props.pinRequired && (
                                <Field
                                    label={i18n.get('creditCard.pin.title')}
                                    classNameModifiers={['pin', '30']}
                                    errorMessage={sfpState.errors.encryptedSecurityCode && i18n.get(sfpState.errors.encryptedSecurityCode)}
                                    focused={focusedElement === 'encryptedSecurityCode'}
                                    onFocusField={() => setFocusOn('encryptedSecurityCode')}
                                    dir={'ltr'}
                                    name={'encryptedSecurityCode'}
                                >
                                    <DataSfSpan
                                        encryptedFieldType="encryptedSecurityCode"
                                        data-info='{"length":"3-10", "maskInterval": 0}'
                                        className={classNames({
                                            'adyen-checkout__input': true,
                                            'adyen-checkout__input--large': true,
                                            'adyen-checkout__card__cvc__input': true,
                                            'adyen-checkout__input--error': sfpState.errors.encryptedSecurityCode,
                                            'adyen-checkout__input--focus': focusedElement === 'encryptedSecurityCode'
                                        })}
                                    />
                                </Field>
                            )}

                            {props.expiryDateRequired && (
                                <Field
                                    label={i18n.get('creditCard.expiryDateField.title')}
                                    classNameModifiers={['expireDate']}
                                    errorMessage={sfpState.errors.encryptedExpiryDate}
                                    focused={focusedElement === 'encryptedExpiryDate'}
                                    onFocusField={() => setFocusOn('encryptedExpiryDate')}
                                    dir={'ltr'}
                                    name={'encryptedExpiryDate'}
                                >
                                    <DataSfSpan
                                        encryptedFieldType={'encryptedExpiryDate'}
                                        className={classNames(
                                            'adyen-checkout__input',
                                            'adyen-checkout__input--small',
                                            'adyen-checkout__card__exp-date__input',
                                            [styles['adyen-checkout__input']],
                                            {
                                                'adyen-checkout__input--error': sfpState.errors.encryptedExpiryDate,
                                                'adyen-checkout__input--focus': focusedElement === 'encryptedExpiryDate',
                                                'adyen-checkout__input--valid':
                                                    !!sfpState.valid.encryptedExpiryMonth && !!sfpState.valid.encryptedExpiryYear
                                            }
                                        )}
                                    />
                                </Field>
                            )}
                        </div>
                    )}
                />

                {this.props.showPayButton &&
                    this.props.payButton({
                        status: this.state.status,
                        onClick: this.props.onBalanceCheck,
                        label: i18n.get('applyGiftcard')
                    })}
            </div>
        );
    }
}

export default Giftcard;
