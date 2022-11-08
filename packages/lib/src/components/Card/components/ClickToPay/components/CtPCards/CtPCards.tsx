import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPSingleCard from './CtPSingleCard/CtPSingleCard';
import getImage from '../../../../../../utils/get-image';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import PayButton from '../../../../../internal/PayButton';
import { amountLabel } from '../../../../../internal/PayButton/utils';
import CtPCardsList from './CtPCardsList';
import ShopperCard from '../../models/ShopperCard';
import CtPEmptyCardsList from './CtPEmptyCardsList';
import './CtPCards.scss';

type CtPCardsProps = {
    onShowCardButtonClick(): void;
};

const CtPCards = ({ onShowCardButtonClick }: CtPCardsProps) => {
    const { loadingContext, i18n } = useCoreContext();
    const { amount, cards, checkout, isCtpPrimaryPaymentMethod, status, onSubmit, onSetStatus, onError } = useClickToPayContext();
    const [checkoutCard, setCheckoutCard] = useState<ShopperCard>(cards[0]);

    const doCheckout = useCallback(async () => {
        if (!checkoutCard) return;

        try {
            onSetStatus('loading');
            const payload = await checkout(checkoutCard);
            onSubmit(payload);
        } catch (error) {
            onError(error);
        }
    }, [checkout, checkoutCard]);

    const handleOnChangeCard = useCallback((card: ShopperCard) => {
        setCheckoutCard(card);
    }, []);

    if (cards.length === 0) {
        return <CtPEmptyCardsList onShowCardButtonClick={onShowCardButtonClick} />;
    }

    const hasAvailableCards = cards.some(card => card.isExpired === false);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__section-title">{i18n.get('ctp.cards.title')}</div>
            <div className="adyen-checkout-ctp__section-subtitle">{i18n.get('ctp.cards.subtitle')}</div>

            {cards.length === 1 ? <CtPSingleCard card={cards[0]} /> : <CtPCardsList cards={cards} onChangeCard={handleOnChangeCard} />}

            <PayButton
                disabled={!hasAvailableCards}
                amount={amount}
                label={i18n.get('payButton.with', {
                    values: { value: amountLabel(i18n, amount), maskedData: `•••• ${checkoutCard?.panLastFour}` }
                })}
                status={status}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })(isCtpPrimaryPaymentMethod ? 'lock' : 'lock_black')}
                onClick={doCheckout}
            />
        </Fragment>
    );
};

export default CtPCards;
