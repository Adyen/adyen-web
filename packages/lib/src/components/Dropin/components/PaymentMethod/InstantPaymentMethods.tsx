import { Fragment, h } from 'preact';
import ContentSeparator from '../../../internal/ContentSeparator';
import useCoreContext from '../../../../core/Context/useCoreContext';
import UIElement from '../../../UIElement';

interface InstantPaymentMethodsProps {
    paymentMethods: UIElement[];
    showContentSeparator: boolean;
}

function InstantPaymentMethods({ paymentMethods, showContentSeparator }: InstantPaymentMethodsProps) {
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <ul className="adyen-checkout__instant-payment-methods-list">
                {paymentMethods.map(pm => (
                    <li key={pm.type}>{pm.render()}</li>
                ))}
            </ul>
            {showContentSeparator && <ContentSeparator label={i18n.get('orPayWith')} />}
        </Fragment>
    );
}

export default InstantPaymentMethods;
