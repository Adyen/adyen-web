import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import Button from '../../../../internal/Button';
import useClickToPayContext from '../context/useClickToPayContext';
import { CheckoutPayload, ShopperCard } from '../../../services/types';

const buttonStyle = {
    width: '100%',
    height: '40px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 0 0 2px #999595',
    cursor: 'pointer'
};

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

            // TODO: Figure out if Visa is going to be returned as part of the paymentCardDescriptor

            onSubmit(payload);
        },
        [checkout]
    );

    return (
        <Fragment>
            <div>
                {cards?.map((card, index) => (
                    <button key={index} style={buttonStyle} onClick={() => onCheckout(card)}>
                        {card.cardTitle} {`•••• ${card.panLastFour}`}
                    </button>
                ))}
            </div>
            <Button label="Pay" status={isDoingCheckout && 'loading'} />
        </Fragment>
    );
};

export default CtPCardsList;
