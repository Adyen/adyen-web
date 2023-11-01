import { Fragment, h } from 'preact';
import ContentSeparator from '../../../internal/ContentSeparator';
import useCoreContext from '../../../../core/Context/useCoreContext';
import UIElement from '../../../internal/UIElement/UIElement';

interface InstantPaymentMethodsProps {
    paymentMethods: UIElement[];
}

function InstantPaymentMethods({ paymentMethods }: InstantPaymentMethodsProps) {
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <ul className="adyen-checkout__instant-payment-methods-list">
                {paymentMethods.map(pm => (
                    <li key={pm.type}>{pm.render()}</li>
                ))}
            </ul>
            <ContentSeparator label={i18n.get('orPayWith')} />
        </Fragment>
    );
}

export default InstantPaymentMethods;
