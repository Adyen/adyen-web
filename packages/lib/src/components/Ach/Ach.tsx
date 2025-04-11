import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import AchComponent from './components/AchComponent';
import defaultProps from './defaultProps';

import type { AchConfiguration } from './types';

export class AchElement extends UIElement<AchConfiguration> {
    public static type = TxVariants.ach;

    protected static defaultProps = defaultProps;

    public override formatData() {
        const recurringPayment = !!this.props.storedPaymentMethodId;

        if (recurringPayment) {
            return {
                paymentMethod: {
                    type: AchElement.type,
                    storedPaymentMethodId: this.props.storedPaymentMethodId
                }
            };
        }

        return {
            paymentMethod: {
                type: AchElement.type,
                ownerName: this.state.data.ownerName,
                accountHolderType: this.state.data.selectedAccountType?.split('.')[0],
                bankAccountType: this.state.data.selectedAccountType?.split('.')[1],
                bankLocationId: this.state.data.routingNumber,
                bankAccountNumber: this.state.data.accountNumber
            },
            ...(this.state.storePaymentMethod && { storePaymentMethod: this.state.storePaymentMethod })
        };
    }

    public override get isValid(): boolean {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    public override get displayName(): string {
        if (this.props.storedPaymentMethodId && this.props.bankAccountNumber) {
            return `•••• ${this.props.bankAccountNumber.slice(-4)}`;
        }
        return this.props.name;
    }

    public override get additionalInfo(): string {
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
                        hasHolderName={this.props.hasHolderName}
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
