import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import GiftcardComponent from './components/GiftcardComponent';
import { CoreProvider } from '../../core/Context/CoreProvider';
import PayButton from '../internal/PayButton';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { PaymentAmount } from '../../types/global-types';
import { GiftCardElementData, GiftCardConfiguration, balanceCheckResponseType } from './types';
import { TxVariants } from '../tx-variants';

export class GiftcardElement extends UIElement<GiftCardConfiguration> {
    public static type = TxVariants.giftcard;

    protected static defaultProps = {
        brandsConfiguration: {}
    };

    formatProps(props) {
        return {
            ...props?.configuration,
            ...props
        };
    }

    formatData(): GiftCardElementData {
        return {
            paymentMethod: {
                type: this.constructor['type'],
                brand: this.props.brand,
                encryptedCardNumber: this.state.data?.encryptedCardNumber,
                encryptedSecurityCode: this.state.data?.encryptedSecurityCode
            }
        };
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return this.props.brandsConfiguration[this.props.brand]?.icon || this.props.icon || this.resources.getImage()(this.props.brand);
    }

    get displayName() {
        return this.props.brandsConfiguration[this.props.brand]?.name || this.props.name;
    }

    private handleBalanceCheck = (data: GiftCardElementData): Promise<balanceCheckResponseType> => {
        if (this.props.onBalanceCheck) {
            return new Promise((resolve, reject) => {
                void this.props.onBalanceCheck(resolve, reject, data);
            });
        }

        if (this.props.session) {
            return this.props.session.checkBalance(data);
        }
    };

    private onOrderRequest = data => {
        if (this.props.onOrderRequest)
            return new Promise((resolve, reject) => {
                void this.props.onOrderRequest(resolve, reject, data);
            });
        if (this.props.session) {
            return this.props.session.createOrder();
        }
    };

    public balanceCheck() {
        return this.onBalanceCheck();
    }

    private onBalanceCheck = (): void => {
        // skip balance check if no onBalanceCheck event has been defined
        const hasBalanceCheck = this.props.session || this.props.onBalanceCheck;
        if (!hasBalanceCheck) return super.submit();

        this.setStatus('loading');

        this.handleBalanceCheck(this.formatData())
            .then(({ balance, transactionLimit = {} as PaymentAmount }) => {
                if (!balance) throw new Error('card-error'); // card doesn't exist
                if (balance?.currency !== this.props.amount?.currency) throw new Error('currency-error');
                if (balance?.value <= 0) throw new Error('no-balance');

                if (this.props.amount.value > balance.value || this.props.amount.value > transactionLimit.value) {
                    if (this.props.order) {
                        return this.makeSubmitCall();
                    }

                    return this.onOrderRequest(this.data).then((order: { orderData: string; pspReference: string }) => {
                        this.setState({ order: { orderData: order.orderData, pspReference: order.pspReference } });
                        return this.makeSubmitCall();
                    });
                } else {
                    return this.handleOnRequiringConfirmation(balance, transactionLimit);
                }
            })
            .catch(error => {
                this.setStatus(error?.message || 'error');
                if (this.props.onError) {
                    if (error instanceof AdyenCheckoutError) {
                        this.handleError(error);
                    } else {
                        this.handleError(new AdyenCheckoutError('ERROR', error));
                    }
                }
            });
    };

    /**
     * Check if it should call onRequiringConfirmation
     */
    private handleOnRequiringConfirmation = (balance, transactionLimit): Promise<any> => {
        this.componentRef.setBalance({ balance, transactionLimit });
        this.setStatus('ready');

        // 1. if we show pay button we don't need to ask for confirmation
        if (this.props.showPayButton) {
            return;
        }
        // 2. there's no callback, we throw error
        if (!this.props.onRequiringConfirmation) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'onRequiringConfirmation must be provided');
        }
        // 3. success case if in case of custom pay button
        return (
            new Promise<void>((resolve, reject) => {
                void this.props.onRequiringConfirmation(resolve, reject);
            })
                //when this resolve passed to onRequiringConfirmation gets resolved make payments call
                .then(() => this.makeSubmitCall())
                //when it gets rejected handle cancellation
                .catch(() => {})
        );
    };

    public submit() {
        // for simplicity of the merchant we always only expose .submit()
        // however to make the actual payment call we call makeSubmitCall
        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        this.balanceCheck();
    }

    // this makes the payment, as .submit is used by the merchant to trigger the payButton action
    private makeSubmitCall() {
        super.submit();
    }

    // Giftcards override the regular payButton flow
    public payButton = props => {
        return <PayButton {...props} />;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <GiftcardComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    handleKeyPress={this.handleKeyPress}
                    showPayButton={this.props.showPayButton}
                    onChange={this.setState}
                    makeBalanceCheck={() => this.onBalanceCheck()}
                    makePayment={() => this.makeSubmitCall()}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default GiftcardElement;
