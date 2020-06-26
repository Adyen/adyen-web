import { h } from 'preact';
import CoreProvider from '~/core/Context/CoreProvider';
import RedirectElement from '~/components/Redirect';
import RedirectButton from '../internal/RedirectButton';

class GiropayElement extends RedirectElement {
    public static type = 'giropay';

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: GiropayElement.type
            }
        };
    }

    get displayName() {
        return this.props.name || this.constructor['type'];
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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
}

export default GiropayElement;
