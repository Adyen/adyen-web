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
        return {
            paymentMethod: {
                type: this.props.type || DragonpayElement.type,
                ...this.state.data
            }
        };
    }

    formatProps(props) {
        return {
            ...props,
            items: props.details && props.details.length ? (props.details.find(d => d.key === 'issuer') || {}).items : props.items
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
