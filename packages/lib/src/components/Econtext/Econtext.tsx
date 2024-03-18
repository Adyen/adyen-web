import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import EcontextInput from './components/EcontextInput';
import EcontextVoucherResult from './components/EcontextVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import { EcontextConfiguration } from './types';

export class EcontextElement extends UIElement<EcontextConfiguration> {
    public static type = TxVariants.econtext;
    public static txVariants = [
        TxVariants.econtext,
        TxVariants.econtext_atm,
        TxVariants.econtext_online,
        TxVariants.econtext_seven_eleven,
        TxVariants.econtext_stores
    ];

    protected static defaultProps = {
        personalDetailsRequired: true,
        showFormInstruction: true
    };

    get isValid() {
        if (!this.props.personalDetailsRequired) {
            return true;
        }
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.type
            }
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <EcontextVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <EcontextInput
                        setComponentRef={this.setComponentRef}
                        {...this.props}
                        showPayButton={this.props.showPayButton}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default EcontextElement;
