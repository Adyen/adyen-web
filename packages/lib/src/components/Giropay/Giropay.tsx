import { h } from 'preact';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';

class GiropayElement extends RedirectElement {
    public static type = TxVariants.giropay;

    formatProps(props) {
        return {
            ...props,
            showPayButton: props.showButton ?? props.showPayButton
        };
    }

    get displayName() {
        return this.props.name || this.constructor['type'];
    }

    render() {
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

export default GiropayElement;
