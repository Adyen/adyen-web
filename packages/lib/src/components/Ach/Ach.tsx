import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
// import AchInput from './components/AchInput';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import { AchConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import AchComponent from './components/AchComponent';

export class AchElement extends UIElement<AchConfiguration> {
    public static type = TxVariants.ach;

    formatProps(props: AchConfiguration) {
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

        const paymentMethod = {
            type: AchElement.type,
            ownerName: this.state.data.ownerName,
            accountHolderType: this.state.data.selectedAccountType?.split('.')[0],
            bankAccountType: this.state.data.selectedAccountType?.split('.')[1],
            bankLocationId: this.state.data.routingNumber,
            bankAccountNumber: this.state.data.accountNumber,
            ...(recurringPayment && { storedPaymentMethodId: this.props.storedPaymentMethodId })
        };

        return {
            paymentMethod,
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
        if (this.props.storedPaymentMethodId && this.props.bankAccountNumber) {
            // get lastFour from bankAccountNumber, value comes from storedPaymentMethods
            return `•••• ${this.props.bankAccountNumber.slice(-4)}`;
        }
        return this.props.name;
    }

    get additionalInfo() {
        return this.props.storedPaymentMethodId ? this.props.i18n.get('ach.savedBankAccount') : '';
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.storedPaymentMethodId ? (
                    <RedirectButton
                        showPayButton={this.props.showPayButton}
                        name={this.displayName}
                        amount={this.props.amount}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                ) : (
                    <AchComponent
                        onChange={this.setState}
                        payButton={this.payButton}
                        showPayButton={this.props.showPayButton}
                        hasHolderName={true}
                        holderNameRequired={true}
                        placeholders={this.props.placeholders}
                        setComponentRef={this.setComponentRef}
                        enableStoreDetails={this.props.enableStoreDetails}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default AchElement;
