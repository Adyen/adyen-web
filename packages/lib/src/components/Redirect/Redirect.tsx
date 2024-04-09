import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import { RedirectConfiguration } from './types';
import collectBrowserInfo from '../../utils/browserInfo';

class RedirectElement extends UIElement<RedirectConfiguration> {
    public static type = TxVariants.redirect;

    public static defaultProps = {
        type: RedirectElement.type
    };

    formatData() {
        return {
            paymentMethod: {
                type: this.type
            },
            browserInfo: this.browserInfo
        };
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        if (this.props.url && this.props.method) {
            return <RedirectShopper url={this.props.url} {...this.props} />;
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
