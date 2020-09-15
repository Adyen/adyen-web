import { h } from 'preact';

const Surcharge = ({ currency, amount }, { i18n }) => (
    <small className="adyen-checkout__payment-method__surcharge">{`+ ${i18n.amount(amount, currency)}`}</small>
);

export default Surcharge;
