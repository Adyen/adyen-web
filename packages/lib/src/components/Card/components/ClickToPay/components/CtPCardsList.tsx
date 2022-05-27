import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import Button from '../../../../internal/Button';
import useClickToPayContext from '../context/useClickToPayContext';

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

const CtPCardsList = () => {
    const { cards, checkout } = useClickToPayContext();
    const [isDoingCheckout, setIsDoingCheckout] = useState<boolean>(false);

    const onCheckout = useCallback(
        async (srcDigitalCardId: string, paymentCardDescriptor: string, srcCorrelationId: string) => {
            console.log('Checkout', srcDigitalCardId, paymentCardDescriptor, srcCorrelationId);
            setIsDoingCheckout(true);
            await checkout(srcDigitalCardId, paymentCardDescriptor || 'visa', srcCorrelationId);
            setIsDoingCheckout(false);
            // TODO: Figure out if Visa is going to be returned as part of the paymentCardDescriptor
        },
        [checkout]
    );

    return (
        <Fragment>
            <div>
                {cards?.map((card, index) => (
                    <button
                        key={index}
                        style={buttonStyle}
                        onClick={() => onCheckout(card.srcDigitalCardId, card.paymentCardDescriptor, card.srcCorrelationId)}
                    >
                        {card.cardTitle} {`•••• ${card.panLastFour}`}
                    </button>
                ))}
            </div>
            <Button label="Pay" status={isDoingCheckout && 'loading'} />
        </Fragment>
    );
};

export default CtPCardsList;
