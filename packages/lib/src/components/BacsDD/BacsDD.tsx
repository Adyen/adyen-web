import { h } from 'preact';
import UIElement from '../UIElement';
import BacsInput from './components/BacsInput';
import Await from '../internal/Await';
import CoreProvider from '../../core/Context/CoreProvider';
// import config from './config';
import RedirectButton from '../../components/internal/RedirectButton';

interface BacsElementData {
    paymentMethod: {
        type: string;
        holderName: string;
        bankAccountNumber: string;
        bankLocationId: string;
        shopperEmail: string;
    };
}

class BacsElement extends UIElement {
    public static type = 'directdebit_GB';

    // formatProps(props) {
    //     const { data = {}, placeholders = {} } = props;
    //
    //     return {
    //         ...props,
    //         data: {
    //             telephoneNumber: data.telephoneNumber || data.phoneNumber || ''
    //         },
    //         placeholders: {
    //             telephoneNumber: placeholders.telephoneNumber || placeholders.phoneNumber || '+351 932 123 456'
    //         }
    //     };
    // }

    formatData(): BacsElementData {
        return {
            paymentMethod: {
                type: BacsElement.type,
                // TODO - maybe just spread this.state.data
                ...(this.state.data?.holderName && { holderName: this.state.data.holderName }),
                ...(this.state.data?.bankAccountNumber && { bankAccountNumber: this.state.data.bankAccountNumber }),
                ...(this.state.data?.bankLocationId && { bankLocationId: this.state.data.bankLocationId }),
                ...(this.state.data?.shopperEmail && { shopperEmail: this.state.data.shopperEmail })
            }
        };
    }

    get isValid(): boolean {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    render() {
        // if (this.props.downloadURL) {
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

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.storedPaymentMethodId ? (
                    // This will be the non-editable second page
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
                    // This will be the actual input, first page
                    <BacsInput
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

export default BacsElement;
