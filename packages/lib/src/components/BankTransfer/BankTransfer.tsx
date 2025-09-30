import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import { BankTransferConfiguration, BankTransferState } from './types';
import BankTransferResult from './components/BankTransferResult';
import BankTransferInput from './components/BankTransferInput';
import { TxVariants } from '../tx-variants';

export class BankTransferElement extends UIElement<BankTransferConfiguration> {
    public static type = TxVariants.bankTransfer_IBAN;
    public static txVariants = [
        TxVariants.bankTransfer_IBAN,
        TxVariants.bankTransfer_BE,
        TxVariants.bankTransfer_NL,
        TxVariants.bankTransfer_PL,
        TxVariants.bankTransfer_FR,
        TxVariants.bankTransfer_CH,
        TxVariants.bankTransfer_IE,
        TxVariants.bankTransfer_GB,
        TxVariants.bankTransfer_DE,
        TxVariants.bankTransfer_AE,
        TxVariants.bankTransfer_AT,
        TxVariants.bankTransfer_AU,
        TxVariants.bankTransfer_BG,
        TxVariants.bankTransfer_CA,
        TxVariants.bankTransfer_EE,
        TxVariants.bankTransfer_ES,
        TxVariants.bankTransfer_FI,
        TxVariants.bankTransfer_HK,
        TxVariants.bankTransfer_HU,
        TxVariants.bankTransfer_IT,
        TxVariants.bankTransfer_JP,
        TxVariants.bankTransfer_LU,
        TxVariants.bankTransfer_NZ,
        TxVariants.bankTransfer_PT,
        TxVariants.bankTransfer_SG,
        TxVariants.bankTransfer_SK,
        TxVariants.bankTransfer_US
    ];

    public static defaultProps = {
        showEmailAddress: true,
        showContextualElement: true,
        data: { shopperEmail: '' }
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
        const subtype = this.type !== (TxVariants.bankTransfer_IBAN as string) ? { subtype: 'embedded' } : {};

        return {
            paymentMethod: {
                type: this.type,
                ...subtype
            },
            ...(shopperEmail && { shopperEmail })
        };
    }

    render() {
        if (this.props.reference) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <BankTransferResult {...this.props} onActionHandled={this.onActionHandled} />
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.showEmailAddress && <BankTransferInput setComponentRef={this.setComponentRef} {...this.props} onChange={this.setState} />}
                <RedirectButton
                    {...this.props}
                    showPayButton={this.props.showPayButton}
                    name={this.displayName}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default BankTransferElement;
