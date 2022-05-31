import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import Button from '../../../../../internal/Button';
import useClickToPayContext from '../../context/useClickToPayContext';
import { CheckoutPayload, ShopperCard } from '../../services/types';
import './CtPCardsList.scss';

type CtPCardsListProps = {
    onSubmit(payload: CheckoutPayload): void;
};

const CtPCardsList = ({ onSubmit }: CtPCardsListProps) => {
    const { cards, checkout } = useClickToPayContext();
    const [isDoingCheckout, setIsDoingCheckout] = useState<boolean>(false);

    const onCheckout = useCallback(
        async (card: ShopperCard) => {
            setIsDoingCheckout(true);
            const payload = await checkout(card);
            setIsDoingCheckout(false);
            onSubmit(payload);
        },
        [checkout]
    );

    return (
        <Fragment>
            <div>
                {cards?.map((card, index) => (
                    <button type="button" key={index} className={'adyen-checkout-ctp__card'} onClick={() => onCheckout(card)}>
                        {card.cardTitle} {`•••• ${card.panLastFour}`}
                    </button>
                ))}
            </div>
            <Button label="Pay" status={isDoingCheckout && 'loading'} />
        </Fragment>
    );
};

export default CtPCardsList;
