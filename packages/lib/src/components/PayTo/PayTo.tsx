import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
import { PayToIdentifierEnum } from './components/IdentifierSelector';
import PayToComponent from './components/PayToComponent';
import { PayToInstructions } from './components/PayToInstructions';
import MandateSummary from './components/MandateSummary';
import { PayToConfiguration, PayToData } from './types';
import PayButton, { payAmountLabel } from '../internal/PayButton';

/*
Await Config (previously in its own file)
 */
const COUNTDOWN_MINUTES = 15; // min
const THROTTLE_TIME = 60000; // ms
const THROTTLE_INTERVAL = 10000; // ms

const config = {
    COUNTDOWN_MINUTES,
    THROTTLE_TIME,
    THROTTLE_INTERVAL,
    showCountdownTimer: false
};

const getAccountIdentifier = (state: PayToData) => {
    // if it's BSB Input type merge bankAccount with BSB
    if (state.selectedInput === 'bsb-option') {
        return `${state.bsb}-${state.bankAccountNumber}`;
    } else if (state.selectedInput === 'payid-option') {
        // otherwise use the option in the dropdown
        switch (state.selectedIdentifier) {
            case PayToIdentifierEnum.email:
                return state.email;
            case PayToIdentifierEnum.abn:
                return state.abn;
            case PayToIdentifierEnum.orgid:
                return state.orgid;
            case PayToIdentifierEnum.phone:
                // merge the phone prefix and number - see comment in ticket
                return `${state.phonePrefix}-${state.phoneNumber}`;
        }
    }
};
/**
 *
 */
export class PayToElement extends UIElement<PayToConfiguration> {
    public static readonly type = TxVariants.payto;

    protected static defaultProps = {
        placeholders: {}
    };

    formatProps(props: PayToConfiguration) {
        return {
            ...props,
            data: {
                ...props.data,
                phonePrefix: '+61' // hardcode +61
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        if (this.props.storedPaymentMethodId) {
            return {
                paymentMethod: {
                    type: PayToElement.type,
                    storedPaymentMethodId: this.props.storedPaymentMethodId
                }
            };
        }

        return {
            paymentMethod: {
                type: PayToElement.type,
                shopperAccountIdentifier: getAccountIdentifier(this.state.data)
            },
            shopperName: {
                firstName: this.state.data.firstName,
                lastName: this.state.data.lastName
            }
        };
    }

    get isValid(): boolean {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    get displayName() {
        if (this.props.storedPaymentMethodId && this.props.label) {
            return this.props.label;
        }
        return this.props.name;
    }

    get additionalInfo() {
        return this.props.storedPaymentMethodId ? this.props.name : '';
    }

    render() {
        // Stored
        if (this.props.storedPaymentMethodId) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    {this.props.showPayButton && (
                        <PayButton
                            {...this.props}
                            classNameModifiers={['standalone']}
                            amount={this.props.amount}
                            label={payAmountLabel(this.props.i18n, this.props.amount)}
                            onClick={this.submit}
                        />
                    )}
                </CoreProvider>
            );
        }
        // Await
        if (this.props.paymentData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <SRPanelProvider srPanel={this.props.modules.srPanel}>
                        <Await
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                            amount={this.props.amount}
                            showAmount={true}
                            instructions={PayToInstructions}
                            clientKey={this.props.clientKey}
                            paymentData={this.props.paymentData}
                            onError={this.props.onError}
                            onComplete={this.onComplete}
                            brandLogo={this.icon}
                            type={this.constructor['type']}
                            messageText={this.props.i18n.get('payto.confirmPayment')}
                            awaitText={this.props.i18n.get('payto.await.waitForConfirmation')}
                            showCountdownTimer={config.showCountdownTimer}
                            throttleTime={config.THROTTLE_TIME}
                            throttleInterval={config.THROTTLE_INTERVAL}
                            onActionHandled={this.onActionHandled}
                            endSlot={() =>
                                !!this.props.mandate && (
                                    <MandateSummary mandate={this.props.mandate} payee={this.props.payee} currencyCode={this.props.amount.currency} />
                                )
                            }
                        />
                    </SRPanelProvider>
                </CoreProvider>
            );
        }
        // Input
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PayToComponent
                    data={this.props.data}
                    placeholders={this.props.placeholders}
                    setComponentRef={this.setComponentRef}
                    onChange={this.setState}
                    payButton={this.payButton}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default PayToElement;
