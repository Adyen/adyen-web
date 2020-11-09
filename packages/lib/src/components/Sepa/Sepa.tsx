import { h } from 'preact';
import UIElement from '../UIElement';
import IbanInput from './components/IbanInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { SepaElementData } from './types';

/**
 * SepaElement
 */
class SepaElement extends UIElement {
    public static type = 'sepadirectdebit';

    /**
     * Formats props on construction time
     */
    formatProps(props) {
        return {
            holderName: true,
            ...props
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): SepaElementData {
        return {
            paymentMethod: {
                type: SepaElement.type,
                iban: this.state.data['sepa.ibanNumber'],
                ownerName: this.state.data['sepa.ownerName']
            }
        };
    }

    /**
     * Returns whether the component state is valid or not
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
