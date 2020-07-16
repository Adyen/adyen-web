import { h } from 'preact';
import UIElement from '../UIElement';
import SecuredFields from '../internal/SecuredFields';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import getImage from '../../utils/get-image';

export class SecuredFieldsElement extends UIElement {
    public static type = 'scheme';

    formatProps(props) {
        return {
            ...props,
            type: props.type === 'scheme' ? 'card' : props.type,
            ...(props.brands && !props.groupTypes && { groupTypes: props.brands })
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: SecuredFieldsElement.type,
                ...this.state.data
            },
            browserInfo: this.browserInfo
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef?.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(frame) {
        if (this.componentRef?.setFocusOn) this.componentRef.setFocusOn(frame);
        return this;
    }

    processBinLookupResponse(binLookupObject) {
        if (this.componentRef?.processBinLookupResponse) this.componentRef.processBinLookupResponse(binLookupObject);
        return this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <SecuredFields
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    rootNode={this._node}
                    onChange={this.setState}
                />
            </CoreProvider>
        );
    }
}

export default SecuredFieldsElement;
