import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';

/*
Types (previously in their own file)
 */
import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';
import { PayIdFormData } from './components/PayIDInput';
import { PayToIdentifierEnum } from './components/IdentifierSelector';
import PayToComponent, { PayToComponentData } from './components/PayToComponent';
import { BSBFormData } from './components/BSBInput';
import { PayToInstructions } from './components/PayToInstructions';
import MandateSummary from './components/MandateSummary';

//TODO export type MandateFrequencyType = 'adhoc' | 'daily' | 'weekly' | 'biWeekly' | 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

export interface MandateType {
    amount: string;
    amountRule: string;
    frequency: string;
    startsAt?: string;
    endsAt: string;
    remarks: string;
    count?: string;
}

export interface PayToConfiguration extends UIElementProps {
    paymentData?: any;
    data?: PayToData;
    placeholders?: any; //TODO
    mandate: MandateType;
    instructions?: any; //TODO this probably should not be here
}

export interface PayToData extends PayIdFormData, BSBFormData, PayToComponentData {
    shopperAccountIdentifier: string;
}

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
    public static type = TxVariants.payto;

    protected static defaultProps = {
        placeholders: {}
    };

    formatProps(props) {
        return {
            ...props,
            data: {
                ...props.data,
                phonePrefix: props.data?.phonePrefix || '+61' // use AUS as default value
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: PayToElement.type,
                shopperAccountIdentifier: getAccountIdentifier(this.state.data)
            },
            shopperName: {
                firstName: this.state.data.firstName,
                lastName: this.state.data.lastName
            },
            mandate: this.props.mandate
        };
    }

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    get displayName(): string {
        return this.props.name;
    }

    render() {
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
                            awaitText={this.props.i18n.get('await.waitForConfirmation')}
                            showCountdownTimer={config.showCountdownTimer}
                            throttleTime={config.THROTTLE_TIME}
                            throttleInterval={config.THROTTLE_INTERVAL}
                            onActionHandled={this.onActionHandled}
                            endSlot={() => <MandateSummary mandate={this.props.mandate} currencyCode={this.props.amount.currency} />}
                        />
                    </SRPanelProvider>
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PayToComponent
                    data={this.props.data}
                    placeholders={this.props.placeholders}
                    setComponentRef={this.setComponentRef}
                    onSubmit={this.submit}
                    onChange={this.setState}
                    payButton={this.payButton}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default PayToElement;
