import RedirectElement from '../Redirect';
import PayButton, { payAmountLabel } from '../internal/PayButton';
import { h } from 'preact';
import { TxVariants } from '../tx-variants';

class TwintElement extends RedirectElement {
    public static type = TxVariants.twint;

    public static defaultProps = {
        type: TwintElement.type,
        name: 'Twint'
    };
    /**
     * Get the element displayable name
     */
    get displayName(): string {
        const { i18n, name, isStoredPaymentMethod } = this.props;
        return isStoredPaymentMethod ? `${name} ${i18n.get('twint.saved')}` : name || this.constructor['type'];
    }

    public payButtonLabel() {
        const { i18n, amount, isStoredPaymentMethod, name } = this.props;
        if (isStoredPaymentMethod) return payAmountLabel(i18n, amount);
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
