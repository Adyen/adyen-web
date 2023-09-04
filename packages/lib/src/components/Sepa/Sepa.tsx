import { h } from 'preact';
import UIElement from '../UIElement';
import IbanInput from '../internal/IbanInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { SepaElementData } from './types';
import { TxVariants } from '../tx-variants';

/**
 * SepaElement
 */
class SepaElement extends UIElement {
    public static type = TxVariants.sepadirectdebit;

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
                iban: this.state.data['ibanNumber'],
                ownerName: this.state.data['ownerName']
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
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
