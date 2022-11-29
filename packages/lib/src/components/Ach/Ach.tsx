import { h } from 'preact';
import UIElement from '../UIElement';
import AchInput from './components/AchInput';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import { AchElementProps } from './types';

export class AchElement extends UIElement<AchElementProps> {
    public static type = 'ach';

    formatProps(props: AchElementProps) {
        return {
            ...props,
            // Fix mismatch between passed hasHolderName & holderNameRequired props
            // (when holderNameRequired = true, but hasHolderName = false - which means component will never be valid)
            holderNameRequired: props.hasHolderName ?? props.holderNameRequired
            // TODO - if it turns out that hasHolderName & holderNameRequired are not configurable by the merchant
            //  then we will need to force these properties to true
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const recurringPayment = !!this.props.storedPaymentMethodId;

        // Map holderName to ownerName
        const paymentMethod = {
            type: AchElement.type,
            ...this.state.data,
            ownerName: this.state.data?.holderName,
            ...(recurringPayment && { storedPaymentMethodId: this.props.storedPaymentMethodId })
        };

        delete paymentMethod.holderName;

        return {
            paymentMethod,
            ...(this.state.billingAddress && { billingAddress: this.state.billingAddress }),
            ...(this.state.storePaymentMethod && { storePaymentMethod: this.state.storePaymentMethod })
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef && this.componentRef.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(fieldName) {
        if (this.componentRef && this.componentRef.setFocusOn) this.componentRef.setFocusOn(fieldName);
        return this;
    }

    get isValid() {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.storedPaymentMethodId ? (
                    <RedirectButton
                        name={this.displayName}
                        amount={this.props.amount}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                ) : (
                    <AchInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default AchElement;
