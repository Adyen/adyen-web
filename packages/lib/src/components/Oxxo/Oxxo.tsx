import { h } from 'preact';
import UIElement from '../UIElement';
import OxxoVoucherResult from './components/OxxoVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import { OxxoElementData } from './types';
import { UIElementProps } from '../types';

export class OxxoElement extends UIElement {
    public static type = 'oxxo';

    protected static defaultProps: UIElementProps = {
        showPayButton: false,
        name: 'Oxxo'
    };

    get isValid(): boolean {
        return true;
    }

    formatData(): OxxoElementData {
        return {
            paymentMethod: {
                type: this.props.type || OxxoElement.type
            }
        };
    }

    private handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <OxxoVoucherResult ref={this.handleRef} {...this.props} />
                ) : (
                    this.props.showPayButton &&
                    this.payButton({
                        ...this.props,
                        classNameModifiers: ['standalone'],
                        label: `${this.props.i18n.get('continueTo')} ${this.props.name}`,
                        onClick: this.submit
                    })
                )}
            </CoreProvider>
        );
    }
}

export default OxxoElement;
