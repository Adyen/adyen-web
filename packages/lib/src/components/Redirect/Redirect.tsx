import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import RedirectShopper from './components/RedirectShopper';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import { RedirectConfiguration } from './types';
import collectBrowserInfo from '../../utils/browserInfo';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';

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
        const event = new AnalyticsErrorEvent({
            component: this.props.paymentMethodType,
            errorType: ErrorEventType.redirect,
            code: ErrorEventCode.REDIRECT
        });
        super.submitAnalytics(event);
    };

    get isRedirecting() {
        return !!this.props.url && !!this.props.method;
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    protected override componentToRender(): h.JSX.Element {
        if (this.isRedirecting) {
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
            );
        }

        return null;
    }
}

export default RedirectElement;
