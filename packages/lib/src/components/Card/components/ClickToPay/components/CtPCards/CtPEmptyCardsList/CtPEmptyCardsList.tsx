import { Fragment, h } from 'preact';
import Button from '../../../../../../internal/Button';
import useClickToPayContext from '../../../context/useClickToPayContext';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPEmptyCards.scss';

const CtPEmptyCardsList = () => {
    const { i18n } = useCoreContext();
    const { isCtpPrimaryPaymentMethod } = useClickToPayContext();

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__section-title">{i18n.get('ctp.cards.title')}</div>
            <div className="adyen-checkout-ctp__section-subtitle">{i18n.get('ctp.emptyCardsView.subtitle')}</div>

            <div className="adyen-checkout-ctp__empty-cards">{i18n.get('ctp.emptyCardsView.message')}</div>

            <Button disabled label={i18n.get('payButton')} variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'} />
        </Fragment>
    );
};

export default CtPEmptyCardsList;
