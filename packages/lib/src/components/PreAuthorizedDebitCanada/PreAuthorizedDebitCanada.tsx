import { h, Fragment } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import PreAuthorizedDebitCanadaComponent from './components/PreAuthorizedDebitCanadaComponent';
import { SettlementInfo } from './components/SettlementInfo';
import RedirectButton from '../internal/RedirectButton';
import { payAmountLabel } from '../internal/PayButton';

import type { PreAuthorizedDebitCanadaConfiguration } from './types';

export class PreAuthorizedDebitCanada extends UIElement<PreAuthorizedDebitCanadaConfiguration> {
    public static type = TxVariants.eft_directdebit_CA;

    public override formatData() {
        const recurringPayment = !!this.props.storedPaymentMethodId;

        if (recurringPayment) {
            return {
                paymentMethod: {
                    type: PreAuthorizedDebitCanada.type,
                    storedPaymentMethodId: this.props.storedPaymentMethodId
                }
            };
        }

        return {
            paymentMethod: {
                type: PreAuthorizedDebitCanada.type,
                ownerName: this.state.data.ownerName,
                bankAccountNumber: this.state.data.bankAccountNumber,
                bankCode: this.state.data.bankCode,
                bankLocationId: this.state.data.bankLocationId
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
        if (this.props.storedPaymentMethodId && this.props.lastFour) {
            return `•••• ${this.props.lastFour}`;
        }

        return this.props.name;
    }

    public override get additionalInfo(): string {
        return this.props.storedPaymentMethodId ? this.props.label : '';
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.storedPaymentMethodId ? (
                    <Fragment>
                        <SettlementInfo />
                        <RedirectButton
                            showPayButton={this.props.showPayButton}
                            icon={this.resources?.getImage({ imageFolder: 'components/' })(`bento_lock`)}
                            label={payAmountLabel(this.props.i18n, this.props.amount)}
                            name={this.displayName}
                            amount={this.props.amount}
                            payButton={this.payButton}
                            onSubmit={this.submit}
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                        />
                    </Fragment>
                ) : (
                    <PreAuthorizedDebitCanadaComponent
                        onChange={this.setState}
                        payButton={this.payButton}
                        showPayButton={this.props.showPayButton}
                        placeholders={this.props.placeholders}
                        setComponentRef={this.setComponentRef}
                        showContextualElement={this.props.showContextualElement}
                        enableStoreDetails={true}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default PreAuthorizedDebitCanada;
