import { h } from 'preact';
import UIElement from '../UIElement';
import BacsInput from './components/BacsInput';
import CoreProvider from '../../core/Context/CoreProvider';
import PayButton from '../internal/PayButton';

interface BacsElementData {
    paymentMethod: {
        type: string;
        holderName: string;
        bankAccountNumber: string;
        bankLocationId: string;
    };
    shopperEmail: string;
    billingAddress: object; // TODO - this should not be necessary for the b/e
}

class BacsElement extends UIElement {
    public static type = 'directdebit_GB';

    constructor(props) {
        super(props);
        this.setState({ status: 'enter-data' });
    }

    formatData(): BacsElementData {
        return {
            paymentMethod: {
                type: BacsElement.type,
                ...(this.state.data?.holderName && { holderName: this.state.data.holderName }),
                ...(this.state.data?.bankAccountNumber && { bankAccountNumber: this.state.data.bankAccountNumber }),
                ...(this.state.data?.bankLocationId && { bankLocationId: this.state.data.bankLocationId })
            },
            ...(this.state.data?.shopperEmail && { shopperEmail: this.state.data.shopperEmail }),
            // TODO - billingAddress should not be necessary in order for the /payments endpoint to accept the payment
            billingAddress: {
                street: 'Infinite Loop',
                postalCode: '95014',
                city: 'Cupertino',
                houseNumberOrName: '1',
                country: 'US',
                stateOrProvince: 'CA'
            }
        };
    }

    get isValid(): boolean {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    preSubmit(e, revertToInput) {
        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        // Send back to input stage ('edit' button pressed in BacsInput comp)
        if (revertToInput === true) {
            this.setState({ status: 'enter-data' });
            return;
        }

        const isConfirmationStage = e.currentTarget.className.includes('confirm-data');
        // console.log('### BacsDD::preSubmit:: e.currentTarget.className', e.currentTarget.className);
        console.log('### BacsDD::preSubmit:: isConfirmationStage', isConfirmationStage);

        // Send to confirmation stage
        if (!isConfirmationStage) {
            this.setState({ status: 'confirm-data' });
            return;
        }

        super.submit();
    }

    public payButton = props => {
        return <PayButton {...props} amount={this.props.amount} classNameModifiers={[this.state.status]} onClick={this.preSubmit.bind(this)} />;
    };

    render() {
        // if (this.props.url) {
        //     const accessKey = this.props.originKey || this.props.clientKey;
        //     return (
        //         <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
        //             {/*This would be the pdf download*/}
        //             <Await
        //                 ref={ref => {
        //                     this.componentRef = ref;
        //                 }}
        //                 accessKey={accessKey}
        //                 paymentData={this.props.paymentData}
        //                 onError={this.props.onError}
        //                 onComplete={this.onComplete}
        //                 brandLogo={this.icon}
        //                 type={config.type}
        //                 messageText={this.props.i18n.get(config.messageTextId)}
        //                 awaitText={this.props.i18n.get(config.awaitTextId)}
        //                 showCountdownTimer={config.showCountdownTimer}
        //                 delay={config.STATUS_INTERVAL}
        //                 countdownTime={config.COUNTDOWN_MINUTES}
        //                 throttleTime={config.THROTTLE_TIME}
        //                 throttleInterval={config.THROTTLE_INTERVAL}
        //             />
        //         </CoreProvider>
        //     );
        // }
        console.log('### BacsDD::render:: this.state.status=', this.state.status);
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <BacsInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    onEdit={this.preSubmit}
                    payButton={this.payButton}
                    compState={this.state.status}
                />
            </CoreProvider>
        );
    }
}

export default BacsElement;
