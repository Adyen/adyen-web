import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import './Trustly.scss';

class TrustlyElement extends RedirectElement {
    public static type = TxVariants.trustly;

    get displayName() {
        return this.props.name || this.constructor['type'];
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <div className="adyen-checkout-trustly">
                    <p className="adyen-checkout-trustly__descriptor">{this.props.i18n.get('trustly.descriptor')}</p>
                    <ul className="adyen-checkout-trustly__description-list">
                        <li>{this.props.i18n.get('trustly.description1')}</li>
                        <li>{this.props.i18n.get('trustly.description2')}</li>
                    </ul>
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

export default TrustlyElement;
