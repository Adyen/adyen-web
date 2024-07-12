import { MonizzeFields } from './components/MonizzeFields';
import UIElement from '../UIElement';
import PayButton from '../internal/PayButton';
import CoreProvider from '../../core/Context/CoreProvider';
import GiftcardComponent from '../Giftcard/components/GiftcardComponent';
import { h } from 'preact';
import { PaymentAmount } from '../../types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

export class MonizzeElement extends UIElement {
    public static type = 'monizze_mealvoucher';

    constructor(props) {
        super({
            ...props,
            pinRequired: true,
            expiryDateRequired: true,
            fieldsLayoutComponent: MonizzeFields
        });
    }

    formatProps(props) {
        return {
            brand: props.type,
            ...props
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.constructor['type'],
                brand: this.props.brand,
                encryptedCardNumber: this.state.data?.encryptedCardNumber,
                encryptedSecurityCode: this.state.data?.encryptedSecurityCode
            }
        };
    }

    private handleBalanceCheck = data => {
        if (this.props.onBalanceCheck) {
            return new Promise((resolve, reject) => {
                this.props.onBalanceCheck(resolve, reject, data);
            });
        }

        if (this.props.session) {
            return this.props.session.checkBalance(data);
        }
    };

    get isValid() {
        return !!this.state.isValid;
    }

    public onBalanceCheck = () => {
        // skip balance check if no onBalanceCheck event has been defined
        const hasBalanceCheck = this.props.session || this.props.onBalanceCheck;
        if (!hasBalanceCheck) return this.submit();

        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        this.setStatus('loading');

        this.handleBalanceCheck(this.formatData())
            .then(({ balance, transactionLimit = {} as PaymentAmount }) => {
                // TODO double check this value still make sense
                if (!balance) throw new Error('card-error'); // card doesn't exist
                if (balance?.currency !== this.props.amount?.currency) throw new Error('currency-error');
                if (balance?.value <= 0) throw new Error('no-balance');

                if (this.props.amount.value > balance.value || this.props.amount.value > transactionLimit.value) {
                    return this.submit();
                } else {
                    throw new Error('not-enough-balance');
                }
            })
            .catch(error => {
                this.setStatus(error?.message || 'error');
                if (this.props.onError) this.handleError(new AdyenCheckoutError('ERROR', error));
            });
    };

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
                    onChange={this.setState}
                    onBalanceCheck={this.onBalanceCheck}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default MonizzeElement;
