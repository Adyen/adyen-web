import { h } from 'preact';
import UIElement from '../UIElement';
import getImage from '../../utils/get-image';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';

/**
 * RedirectElement
 */
class RedirectElement extends UIElement {
    public static type = 'redirect';

    public static defaultProps = {
        type: RedirectElement.type,
        showPayButton: true
    };

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
        return getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    render() {
        if (this.props.url && this.props.method) {
            return <RedirectShopper {...this.props} />;
        }

        if (this.props.showButton) {
            return (
                <CoreProvider {...this.props} loadingContext={this.props.loadingContext}>
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
