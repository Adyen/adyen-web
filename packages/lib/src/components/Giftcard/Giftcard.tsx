import { h } from 'preact';
import UIElement from '../UIElement';
import GiftcardComponent from './components/GiftcardComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';
import PayButton from '../internal/PayButton';

export class GiftcardElement extends UIElement {
    public static type = 'giftcard';

    formatProps(props) {
        return props;
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

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.props.brand);
    }

    get displayName() {
        return this.props.name;
    }

    public onBalanceCheck = () => {
        // skip balance check if no onBalanceCheck event has been defined
        if (!this.props.onBalanceCheck) return this.submit();

        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        return new Promise((resolve, reject) => {
            this.setStatus('loading');
            this.props.onBalanceCheck(resolve, reject, this.formatData());
        })
            .then(({ balance }) => {
                if (!balance) throw new Error('card-error'); // card doesn't exist
                if (balance?.currency !== this.props.amount?.currency) throw new Error('currency-error');
                if (balance?.value <= 0) throw new Error('no-balance');

                this.componentRef.setBalance(balance);

                if (this.props.amount.value > balance.value) {
                    if (this.props.order) {
                        return this.submit();
                    }
                    return this.onOrderRequest(this.data);
                }
            })
            .catch(error => {
                this.setStatus(error?.message || 'error');
                if (this.props.onError) this.props.onError(error);
            });
    };

    public onOrderRequest = data => {
        return new Promise((resolve, reject) => {
            this.props.onOrderRequest(resolve, reject, data);
        }).then((order: { orderData: string; pspReference: string }) => {
            this.setState({ order: { orderData: order.orderData, pspReference: order.pspReference } });
            this.submit();
        });
    };

    // Giftcards override the regular payButton flow
    public payButton = props => {
        return <PayButton {...props} />;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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

export default GiftcardElement;
