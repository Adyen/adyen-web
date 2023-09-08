import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';

class RedirectElement extends UIElement {
    public static type = TxVariants.redirect;

    public static defaultProps = {
        type: RedirectElement.type
    };

    formatData() {
        return {
            paymentMethod: {
                type: this.type
            }
        };
    }

    get isValid() {
        return true;
    }

    get icon() {
        return this.resources.getImage()(this.props.type);
    }

    render() {
        if (this.props.url && this.props.method) {
            return <RedirectShopper {...this.props} />;
        }

        if (this.props.showPayButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <RedirectButton
                        {...this.props}
                        name={this.displayName}
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
