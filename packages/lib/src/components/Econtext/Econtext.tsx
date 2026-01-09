import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import EcontextInput from './components/EcontextInput';
import EcontextVoucherResult from './components/EcontextVoucherResult';
import { TxVariants } from '../tx-variants';
import { EcontextConfiguration } from './types';

export class EcontextElement extends UIElement<EcontextConfiguration> {
    public static readonly type = TxVariants.econtext;
    public static readonly txVariants = [
        TxVariants.econtext,
        TxVariants.econtext_atm,
        TxVariants.econtext_online,
        TxVariants.econtext_seven_eleven,
        TxVariants.econtext_stores
    ];

    protected static defaultProps = {
        personalDetailsRequired: true
    };

    get isValid() {
        if (!this.props.personalDetailsRequired) {
            return true;
        }
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.type
            }
        };
    }

    protected override componentToRender(): h.JSX.Element {
        return this.props.reference ? (
            <EcontextVoucherResult
                reference={this.props.reference}
                totalAmount={this.props.totalAmount}
                expiresAt={this.props.expiresAt}
                paymentMethodType={this.props.paymentMethodType}
                maskedTelephoneNumber={this.props.maskedTelephoneNumber}
                instructionsUrl={this.props.instructionsUrl}
                alternativeReference={this.props.alternativeReference}
                collectionInstitutionNumber={this.props.collectionInstitutionNumber}
                onActionHandled={this.onActionHandled}
            />
        ) : (
            <EcontextInput
                setComponentRef={this.setComponentRef}
                data={this.props.data}
                personalDetailsRequired={this.props.personalDetailsRequired}
                showPayButton={this.props.showPayButton}
                onChange={this.setState}
                onSubmit={this.submit}
                payButton={this.payButton}
            />
        );
    }
}

export default EcontextElement;
