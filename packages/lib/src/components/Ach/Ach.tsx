import { h } from 'preact';
import UIElement from '../UIElement';
import AchInput from './components/AchInput';
import CoreProvider from '../../core/Context/CoreProvider';

export class AchElement extends UIElement {
    public static type = 'ach';

    formatProps(props) {
        return {
            ...props,
            // Fix mismatch between passed hasHolderName & holderNameRequired props
            // (when holderNameRequired = true, but hasHolderName = false - which means component will never be valid)
            holderNameRequired: props.hasHolderName ?? props.holderNameRequired
            // TODO - if it turns out that hasHolderName & holderNameRequired are not configurable by the merchant
            //  then we will need to force these properties to true
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        // Map holderName to ownerName
        const paymentMethod = {
            type: AchElement.type,
            ...this.state.data,
            ownerName: this.state.data?.holderName
        };

        delete paymentMethod.holderName;

        return {
            paymentMethod,
            ...(this.state.billingAddress && { billingAddress: this.state.billingAddress })
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef && this.componentRef.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(fieldName) {
        if (this.componentRef && this.componentRef.setFocusOn) this.componentRef.setFocusOn(fieldName);
        return this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <AchInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default AchElement;
