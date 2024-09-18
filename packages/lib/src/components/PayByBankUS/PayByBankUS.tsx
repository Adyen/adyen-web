import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import './PayByBankUS.scss';
import getIssuerImageUrl from '../../utils/get-issuer-image';

export default class PayByBankUS extends RedirectElement {
    public static type = TxVariants.paybybank_AIS_DD;

    /* TODO
    DONE render component over PbB US
    DONE - show correct disclaimer messages
    TODO - upload translations  
    TODO - fix logo
    DONE - display brands
    DONE - deduplicate css classes
    TODO - check if needs clean/refactor
    */

    protected formatProps(props) {
        return {
            // paymentMethodBrands configuration
            keepBrandsVisible: true,
            showOtherInsteafOfNumber: true,
            ...props
        };
    }

    get displayName() {
        return this.props.name || this.constructor['type'];
    }

    /*
    Hardcode US brands 
    */
    get brands(): { icon: any; name: string }[] {
        const getImage = props => this.resources.getImage(props);
        // paybybank_AIS_DD / tx_variant not used here since images are kept in paybybank subfolder
        const getIssuerIcon = getIssuerImageUrl({}, 'paybybank', getImage);

        // hardcoding
        return [
            { icon: getIssuerIcon('US-1'), name: 'Wells Fargo' },
            { icon: getIssuerIcon('US-2'), name: 'Bank of America' },
            { icon: getIssuerIcon('US-3'), name: 'Chase' },
            { icon: getIssuerIcon('US-4'), name: 'Citi' }
        ];
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <div className="adyen-checkout-paybybank_AIS_DD">
                    <p className="adyen-checkout-paybybank_AIS_DD__description-header">{this.props.i18n.get('payByBankAISDD.disclaimer.header')}</p>
                    <p className="adyen-checkout-paybybank_AIS_DD__description-body">{this.props.i18n.get('payByBankAISDD.disclaimer.body')}</p>
                </div>

                {this.props.showPayButton && (
                    <RedirectButton
                        {...this.props}
                        showPayButton={this.props.showPayButton}
                        name={this.displayName}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                )}
            </CoreProvider>
        );
    }
}
