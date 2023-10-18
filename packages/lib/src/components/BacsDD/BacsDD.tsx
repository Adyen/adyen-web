import { h } from 'preact';
import UIElement from '../UIElement';
import BacsInput from './components/BacsInput';
import CoreProvider from '../../core/Context/CoreProvider';
import BacsResult from './components/BacsResult';
import PayButton from '../internal/PayButton';
import { TxVariants } from '../tx-variants';
import { VoucherActionElement } from '../types';

interface BacsElementData {
    paymentMethod: {
        type: string;
        holderName: string;
        bankAccountNumber: string;
        bankLocationId: string;
    };
    shopperEmail: string;
}

class BacsElement extends UIElement<VoucherActionElement> {
    public static type = TxVariants.directdebit_GB;

    protected static defaultProps = {
        showFormInstruction: true
    };

    formatData(): BacsElementData {
        return {
            paymentMethod: {
                type: BacsElement.type,
                ...(this.state.data?.holderName && { holderName: this.state.data.holderName }),
                ...(this.state.data?.bankAccountNumber && { bankAccountNumber: this.state.data.bankAccountNumber }),
                ...(this.state.data?.bankLocationId && { bankLocationId: this.state.data.bankLocationId })
            },
            ...(this.state.data?.shopperEmail && { shopperEmail: this.state.data.shopperEmail })
        };
    }

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    public payButton = props => {
        return <PayButton amount={this.props.amount} onClick={this.submit} {...props} />;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.url ? (
                    <BacsResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        icon={this.icon}
                        url={this.props.url}
                        paymentMethodType={this.props.paymentMethodType}
                    />
                ) : (
                    <BacsInput
                        // @ts-ignore ref is internal from the Component
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        onChange={this.setState}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default BacsElement;
