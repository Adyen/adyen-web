import { h } from 'preact';
import UIElement from '../UIElement';
import DragonpayInput from './components/DragonpayInput';
import DragonpayVoucherResult from './components/DragonpayVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import { DragonpayElementProps } from './types';

export class DragonpayElement extends UIElement {
    public static type = 'dragonpay';
    public props: DragonpayElementProps;

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { issuer, shopperEmail } = this.state.data;

        return {
            ...(shopperEmail && { shopperEmail }),
            paymentMethod: {
                ...(issuer && { issuer }),
                type: this.props.type || DragonpayElement.type
            }
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.reference ? (
                    <DragonpayVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        icon={this.icon}
                        {...this.props}
                    />
                ) : (
                    <DragonpayInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        items={this.props.issuers}
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

export default DragonpayElement;
