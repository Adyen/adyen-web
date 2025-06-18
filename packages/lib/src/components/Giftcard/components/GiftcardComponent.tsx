import { Component, FunctionComponent, h } from 'preact';
import SecuredFieldsProvider from '../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import Alert from '../../internal/Alert';
import GiftcardResult from './GiftcardResult';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { PaymentAmount } from '../../../types/global-types';
import { GIFT_CARD } from '../../internal/SecuredFields/lib/constants';
import { GiftCardFields } from './GiftcardFields';
import { GiftcardFieldsProps, Placeholders } from './types';
import { useSRPanelForGiftcardErrors } from './useSRPanelForGiftcardErrors';

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
        isValid: false,
        sfpState: {},
        isValidating: false,
        transformedErrors: {}
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

    /**
     * Maps string error codes from SecuredFields to validation rule objects
     */
    public mapErrorsToValidationObjects = () => {
        // Use the sfp reference to call mapErrorsToValidationRuleResult
        if (!this.sfp) return {};
        return this.sfp.mapErrorsToValidationRuleResult();
    };

    public onChange = sfpState => {
        // Add transformed errors to the state
        const transformedErrors = this.mapErrorsToValidationObjects();

        this.setState({
            sfpState,
            transformedErrors
        });

        this.props.onChange({
            data: sfpState.data,
            isValid: sfpState.isSfpValid
        });
    };

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

    public showValidation = () => {
        // TODO check if this is actually needed
        this.setState({
            sfpState: {
                ...this.state.sfpState
            },
            isValidating: true
        });

        // Validate SecuredFields
        this.sfp?.showValidation();
    };

    render(props, { focusedElement, balance, transactionLimit, isValidating, transformedErrors }) {
        const { i18n } = useCoreContext();

        // Handle SRPanel errors in render with transformed error objects
        useSRPanelForGiftcardErrors({
            errors: transformedErrors,
            isValidating
        });

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
                    makeBalanceCheck={props.makeBalanceCheck}
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
