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
import { GiftCardBalanceCheckErrorType } from '../types';

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

    public sfp: SecuredFieldsProvider;

    /**
     * Maps string error codes from SecuredFields to validation rule objects
     */
    public mapErrorsToValidationObjects = () => {
        // Use the sfp reference to call mapErrorsToValidationRuleResult
        if (!this.sfp) return {};
        return this.sfp.mapErrorsToValidationRuleResult();
    };

    private updateTransformedErrors = (balanceCheckErrors?: Record<string, any>) => {
        const transformedErrors = this.mapErrorsToValidationObjects();

        const mergedErrors = { ...transformedErrors, ...balanceCheckErrors };

        this.setState({ transformedErrors: mergedErrors });
    };

    public onChange = sfpState => {
        this.setState({ sfpState }, () => this.updateTransformedErrors());

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

    /**
     * Generates balance check errors in the same format as SFP errors
     * Compatible with the transformedErrors structure
     */
    private generateBalanceCheckErrors(errorType?: GiftCardBalanceCheckErrorType | null): Record<string, any> {
        const balanceCheckErrors: Record<string, any> = {};

        // This is the field that the error is associated with, only used for SR logic
        const fieldToAnnounce = 'encryptedCardNumber';

        // If errorType is null, clear errors
        if (errorType === null) {
            return balanceCheckErrors;
        }

        // Use provided errorType or get from component state
        if (errorType) {
            // Create error in the same format as SFP errors for consistency
            balanceCheckErrors[fieldToAnnounce] = {
                isValid: false,
                errorMessage: `error.giftcard.${errorType}`,
                error: errorType
            };
        }

        return balanceCheckErrors;
    }

    /**
     * Checks if a status represents a balance check error
     */
    private isBalanceCheckError(status: string): boolean {
        return ['no-balance', 'card-error', 'currency-error'].includes(status);
    }

    /**
     * Method called by GiftcardElement to set balance check errors only
     */
    public setBalanceCheckErrors = (errorType: GiftCardBalanceCheckErrorType | null): void => {
        // Check if the errors should be displayed
        if (this.isBalanceCheckError(errorType)) {
            // Generate balance check errors in the style of useForm
            // This is usefull because then we can use the same logic for SF and balance check errors
            // Also we can use the same logic for SRPanel errors
            const balanceCheckErrors = this.generateBalanceCheckErrors(errorType);
            this.updateTransformedErrors(balanceCheckErrors);
        }
    };

    public showValidation = () => {
        this.setState({ isValidating: true });

        // Validate SecuredFields
        this.sfp?.showValidation();
    };

    render(props, { focusedElement, balance, transactionLimit, isValidating, transformedErrors }) {
        const { i18n } = useCoreContext();

        // Handle SRPanel errors in render with transformed error objects
        useSRPanelForGiftcardErrors({
            errors: transformedErrors,
            isValidating,
            sfp: this.sfp
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

            // This logic is a bit of a hack, but it's the only way to get the error message for balance check errors
            // In the future we should move this logic to useForm
            if (transformedErrors.encryptedCardNumber) {
                return i18n.get(transformedErrors.encryptedCardNumber.errorMessage);
            }

            return null;
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
