import { Fragment, h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import './PayByBankUS.scss';
import getIssuerImageUrl from '../../utils/get-issuer-image';
import PayButton, { payAmountLabel } from '../internal/PayButton';

export default class PayByBankUS extends RedirectElement {
    public static type = TxVariants.paybybank_AIS_DD;

    protected formatProps(props) {
        return {
            // paymentMethodBrands configuration
            keepBrandsVisible: true,
            showOtherInsteafOfNumber: true,
            ...props
        };
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
                {this.props.storedPaymentMethodId ? (
                    this.props.showPayButton && (
                        <PayButton
                            {...this.props}
                            classNameModifiers={['standalone']}
                            amount={this.props.amount}
                            label={payAmountLabel(this.props.i18n, this.props.amount)}
                            onClick={this.submit}
                        />
                    )
                ) : (
                    <Fragment>
                        <div className="adyen-checkout-paybybank_AIS_DD">
                            <p className="adyen-checkout-paybybank_AIS_DD__description-header">
                                {this.props.i18n.get('payByBankAISDD.disclaimer.header')}
                            </p>
                            <p className="adyen-checkout-paybybank_AIS_DD__description-body">
                                {this.props.i18n.get('payByBankAISDD.disclaimer.body')}
                            </p>
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
                    </Fragment>
                )}
            </CoreProvider>
        );
    }
}
