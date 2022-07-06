import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import { CheckoutPayload } from '../../services/types';
import CtPSingleCard from './CtPSingleCard/CtPSingleCard';
import getImage from '../../../../../../utils/get-image';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import PayButton from '../../../../../internal/PayButton';
import { amountLabel } from '../../../../../internal/PayButton/utils';
import CtPCardsList from './CtPCardsList';
import ShopperCard from '../../models/ShopperCard';
import './CtPCards.scss';

/**
 * TODO:
 * - Do payments call
 * - Add new text to i18n
 */

type CtPCardsProps = {
    onSubmit(payload: CheckoutPayload): void;
};

const CtPCards = ({ onSubmit }: CtPCardsProps) => {
    const { loadingContext, i18n } = useCoreContext();
    const { amount, cards, checkout, isCtpPrimaryPaymentMethod } = useClickToPayContext();
    const [isDoingCheckout, setIsDoingCheckout] = useState<boolean>(false);
    const [checkoutCard, setCheckoutCard] = useState<ShopperCard>(cards[0]);

    const doCheckout = useCallback(async () => {
        if (!checkoutCard) return;

        setIsDoingCheckout(true);
        const payload = await checkout(checkoutCard);
        setIsDoingCheckout(false);
        onSubmit(payload);
    }, [checkout, checkoutCard]);

    const handleOnChangeCard = useCallback((card: ShopperCard) => {
        setCheckoutCard(card);
    }, []);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__cards-title">{i18n.get('ctp.cards.title')}</div>
            <div className="adyen-checkout-ctp__cards-subtitle">{i18n.get('ctp.cards.subtitle')}</div>

            {cards.length === 1 ? <CtPSingleCard card={cards[0]} /> : <CtPCardsList cards={cards} onChangeCard={handleOnChangeCard} />}

            <PayButton
                amount={amount}
                label={i18n.get('payButton.with', {
                    values: { value: amountLabel(i18n, amount), maskedData: `•••• ${checkoutCard?.panLastFour}` }
                })}
                status={isDoingCheckout && 'loading'}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })(isCtpPrimaryPaymentMethod ? 'lock' : 'lock_dark')}
                onClick={doCheckout}
            />
        </Fragment>
    );
};

export default CtPCards;
