import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { KlarnaPaymentsProps } from './types';
import { KlarnaWidget } from './components/KlarnaWidget/KlarnaWidget';

class KlarnaPayments extends UIElement<KlarnaPaymentsProps> {
    public static type = 'klarna';
    protected static defaultProps = {};

    get isValid() {
        return true;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: this.constructor['type'],
                subtype: 'sdk'
            }
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.sdkData ? (
                    <KlarnaWidget
                        sdkData={this.props.sdkData}
                        payButton={this.payButton}
                        paymentMethodType={this.props.paymentMethodType}
                        paymentData={this.props.paymentData}
                        onComplete={this.onComplete}
                        onError={this.props.onError}
                    />
                ) : (
                    this.payButton({
                        ...this.props,
                        classNameModifiers: ['standalone'],
                        label: `${this.props.i18n.get('continueTo')} ${this.props.name}`
                    })
                )}
            </CoreProvider>
        );
    }
}

export default KlarnaPayments;
