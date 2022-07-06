import { Fragment, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import { CheckoutPayload, ShopperCard } from '../../services/types';
import CtPSingleCard from './CtPSingleCard/CtPSingleCard';
import getImage from '../../../../../../utils/get-image';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import PayButton from '../../../../../internal/PayButton';
import { amountLabel } from '../../../../../internal/PayButton/utils';
import './CtPCards.scss';
import CtPCardsList from './CtPCardsList';

/**
 * TODO:
 * - Finalize the layout for single card
 * - Finalize the layout for cards list
 * - Align with Arjen about the design
 * - Check what to render when payment descriptor is undefined
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
    const [checkoutCard, setCheckoutCard] = useState<ShopperCard>(null);

    useEffect(() => {
        if (cards.length) {
            setCheckoutCard(cards[0]);
        }
    }, [cards]);

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
