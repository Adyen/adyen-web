import { h } from 'preact';
import UIElement from '../UIElement';
import IbanInput from './components/IbanInput';
import CoreProvider from '../../core/Context/CoreProvider';

/**
 * SepaElement
 * @extends UIElement
 */
class SepaElement extends UIElement {
    static type = 'sepadirectdebit';

    /**
     * @private
     * Formats props on construction time
     * @return {P} props
     */
    formatProps(props) {
        return {
            holderName: true,
            ...props
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
     */
    formatData() {
        return {
            paymentMethod: {
                type: SepaElement.type,
                ...this.state.data
            }
        };
    }

    /**
     * Returns whether the component state is valid or not
     * @return {boolean} isValid
     */
    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider {...this.props} loadingContext={this.props.loadingContext}>
                <IbanInput
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

export default SepaElement;
