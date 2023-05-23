import RedirectElement from '../Redirect';
import PayButton, { payAmountLabel } from '../internal/PayButton';
import { h } from 'preact';

/**
 * TwintElement
 */

class TwintElement extends RedirectElement {
    public static type = 'twint';

    public static defaultProps = {
        type: TwintElement.type,
        showPayButton: true
    };
    /**
     * Get the element displayable name
     */
    get displayName(): string {
        const { i18n, name, storedPaymentMethodId } = this.props;
        return storedPaymentMethodId ? `${name} ${i18n.get('twint.saved')}` : name || this.constructor['type'];
    }

    public payButtonLabel() {
        const { i18n, amount, storedPaymentMethodId, name } = this.props;
        if (storedPaymentMethodId) return payAmountLabel(i18n, amount);
        return `${i18n.get('continueTo')} ${name}`;
    }

    /**
     * Overrides RedirectElement default payButton behaviour to use label
     * @param props - props
     */
    public payButton = props => {
        return <PayButton {...props} label={this.payButtonLabel()} onClick={this.submit} />;
    };
}

export default TwintElement;
