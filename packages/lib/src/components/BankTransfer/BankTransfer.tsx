import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import { BankTransferProps, BankTransferState } from './types';
import BankTransferResult from './components/BankTransferResult';
import BankTransferInput from './components/BankTransferInput';

export class BankTransferElement extends UIElement<BankTransferProps> {
    public static type = 'bankTransfer_IBAN';

    public static defaultProps = {
        showPayButton: true,
        showEmailAddress: true
    };

    // @ts-ignore Double check why state extends all props
    public state: BankTransferState = {
        isValid: !this.props.showEmailAddress,
        data: {}
    };

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { shopperEmail } = this.state.data;

        return {
            paymentMethod: {
                type: BankTransferElement.type
            },
            ...(shopperEmail && { shopperEmail })
        };
    }

    private handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        if (this.props.reference) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <BankTransferResult ref={this.handleRef} {...this.props} />
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.showEmailAddress && <BankTransferInput ref={this.handleRef} {...this.props} onChange={this.setState} />}
                {this.props.showPayButton && (
                    <RedirectButton {...this.props} name={this.displayName} onSubmit={this.submit} payButton={this.payButton} />
                )}
            </CoreProvider>
        );
    }
}

export default BankTransferElement;
