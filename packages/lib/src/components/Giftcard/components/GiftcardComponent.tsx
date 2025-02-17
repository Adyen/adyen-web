import { Component, FunctionComponent, h } from 'preact';
import SecuredFieldsProvider from '../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import Alert from '../../internal/Alert';
import GiftcardResult from './GiftcardResult';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { PaymentAmount } from '../../../types/global-types';
import { GIFT_CARD } from '../../internal/SecuredFields/lib/constants';
import { GiftCardFields } from './GiftcardFields';
import { GiftcardFieldsProps, Placeholders } from './types';

interface GiftcardComponentProps {
    onChange: (state) => void;
    onFocus: (event) => void;
    onBlur: (event) => void;

    makeBalanceCheck: (event) => void;
    makePayment: (event) => void;

    amount?: PaymentAmount;
    showPayButton: boolean;
    payButton: (config) => any;

    pinRequired: boolean;
    expiryDateRequired?: boolean;
    fieldsLayoutComponent: FunctionComponent<GiftcardFieldsProps>;
    placeholders?: Placeholders;
    handleKeyPress?: (o: KeyboardEvent) => void;
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
        onBlur: () => {},
        fieldsLayoutComponent: GiftCardFields
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
            return (
                <GiftcardResult
                    amount={this.props.amount}
                    balance={balance}
                    transactionLimit={transactionLimit}
                    makePayment={props.makePayment}
                    status={this.state.status}
                    showPayButton={this.props.showPayButton}
                    payButton={this.props.payButton}
                />
            );
        }

        const getCardErrorMessage = sfpState => {
            if (sfpState.errors.encryptedCardNumber) return i18n.get(sfpState.errors.encryptedCardNumber);

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
                    render={({ setRootNode, setFocusOn }, sfpState) =>
                        this.props.fieldsLayoutComponent({
                            i18n: i18n,
                            pinRequired: this.props.pinRequired,
                            focusedElement: focusedElement,
                            getCardErrorMessage: getCardErrorMessage,
                            setRootNode: setRootNode,
                            setFocusOn: setFocusOn,
                            sfpState: sfpState
                        })
                    }
                />

                {this.props.showPayButton &&
                    this.props.payButton({
                        status: this.state.status,
                        onClick: this.props.makeBalanceCheck,
                        label: i18n.get('applyGiftcard')
                    })}
            </div>
        );
    }
}

export default Giftcard;
