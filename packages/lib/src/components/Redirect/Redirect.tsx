import { h } from 'preact';
import UIElement from '../UIElement';

import CoreProvider from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import collectBrowserInfo from '../../utils/browserInfo';

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
            },
            browserInfo: this.browserInfo
        };
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return true;
    }

    get icon() {
        return this.resources.getImage()(this.props.type);
    }

    get browserInfo() {
        return collectBrowserInfo();
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
