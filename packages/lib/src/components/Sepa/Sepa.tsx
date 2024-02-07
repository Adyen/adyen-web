import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import IbanInput from '../internal/IbanInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { SepaElementData, SepaConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import FormInstruction from '../internal/FormInstruction';
import type { ICore } from '../../core/types';

class SepaElement extends UIElement<SepaConfiguration> {
    public static type = TxVariants.sepadirectdebit;

    protected static defaultProps = {
        showFormInstruction: true
    };

    constructor(checkout: ICore, props?: SepaConfiguration) {
        super(checkout, props);
        this.state = { ...this.state, ...{ data: { ibanNumber: '', ownerName: '' } } };
    }

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
                {this.props.showFormInstruction && <FormInstruction />}
                {/* @ts-ignore TODO: add props */}
                <IbanInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    // onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default SepaElement;
