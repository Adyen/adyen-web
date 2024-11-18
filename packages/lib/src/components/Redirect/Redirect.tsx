import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import { RedirectConfiguration } from './types';
import collectBrowserInfo from '../../utils/browserInfo';
import { ANALYTICS_ERROR_CODE, ANALYTICS_ERROR_TYPE, ANALYTICS_EVENT } from '../../core/Analytics/constants';

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

    private handleRedirectError = () => {
        super.submitAnalytics({
            component: this.props.paymentMethodType,
            type: ANALYTICS_EVENT.error,
            errorType: ANALYTICS_ERROR_TYPE.redirect,
            code: ANALYTICS_ERROR_CODE.redirect
        });
    };

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        if (this.props.url && this.props.method) {
            return (
                <RedirectShopper
                    url={this.props.url}
                    {...this.props}
                    onActionHandled={this.onActionHandled}
                    onRedirectError={this.handleRedirectError}
                />
            );
        }

        if (this.props.showPayButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <RedirectButton
                        {...this.props}
                        showPayButton={this.props.showPayButton}
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
