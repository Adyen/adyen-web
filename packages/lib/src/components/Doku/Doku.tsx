import { h } from 'preact';
import UIElement from '../UIElement';
import DokuInput from './components/DokuInput';
import DokuVoucherResult from './components/DokuVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';

export class DokuElement extends UIElement {
    public static type = 'doku';

    public static txVariants = [
        'doku',
        'doku_alfamart',
        'doku_permata_lite_atm',
        'doku_indomaret',
        'doku_atm_mandiri_va',
        'doku_sinarmas_va',
        'doku_mandiri_va',
        'doku_cimb_va',
        'doku_danamon_va',
        'doku_bri_va',
        'doku_bni_va',
        'doku_bca_va',
        'doku_wallet'
    ];

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.props.type || DokuElement.type
            }
        };
    }

    get icon() {
        return this.resources.getImage({})(this.props.type);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <DokuVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <DokuInput
                        setComponentRef={this.setComponentRef}
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

export default DokuElement;
