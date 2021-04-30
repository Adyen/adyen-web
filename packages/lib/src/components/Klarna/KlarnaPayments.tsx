import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { KlarnaPaymentsProps } from './types';
import { KlarnaWidget } from './components/KlarnaWidget/KlarnaWidget';
import PayButton from '../internal/PayButton';

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

    public payButton = props => {
        return <PayButton amount={this.props.amount} onClick={this.submit} {...props} />;
    };

    render() {
        if (this.props.sdkData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <KlarnaWidget
                        sdkData={this.props.sdkData}
                        payButton={this.payButton}
                        paymentMethodType={this.props.paymentMethodType}
                        paymentData={this.props.paymentData}
                        onComplete={this.onComplete}
                        onError={this.props.onError}
                        onKlarnaDeclined={this.props.onKlarnaDeclined}
                    />
                </CoreProvider>
            );
        } else if (this.props.showPayButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    {this.payButton({
                        ...this.props,
                        classNameModifiers: ['standalone'],
                        label: `${this.props.i18n.get('continueTo')} ${this.displayName}`
                    })}
                </CoreProvider>
            );
        }

        return null;
    }
}

export default KlarnaPayments;
