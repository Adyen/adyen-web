import { h } from 'preact';
import UIElement from '../UIElement';

import CoreProvider from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import Core from '../../core';
import { CardElementProps } from '../Card/types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

/**
 * RedirectElement
 */
class RedirectElement extends UIElement {
    public static type = 'redirect';

    public static defaultProps = {
        type: RedirectElement.type,
        showPayButton: true
    };

    constructor(checkoutRef: Core, props: CardElementProps) {
        if (!(checkoutRef instanceof Core)) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Trying to initialise a component without a reference to an instance of Checkout');
        }

        // If UIElement does the calculating of props...
        // super(checkoutRef, {...props, type: props?.type ?? CardElement.type } );

        const calculatedProps = checkoutRef.generateUIElementProps({ ...props, type: props?.type ?? RedirectElement.type });

        super(calculatedProps);
        console.log('### RedirectElement::constructor:: calculatedProps=', calculatedProps);

        if (!props.isDropin) {
            checkoutRef.storeComponentRef(this as UIElement);
        }
    }

    formatProps(props) {
        return {
            ...props,
            showButton: !!props.showPayButton
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type
            }
        };
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return true;
    }

    get icon() {
        return this.resources.getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    render() {
        if (this.props.url && this.props.method) {
            return <RedirectShopper {...this.props} />;
        }

        if (this.props.showButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <RedirectButton
                        {...this.props}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                </CoreProvider>
            );
        }

        return null;
    }
}

export default RedirectElement;
