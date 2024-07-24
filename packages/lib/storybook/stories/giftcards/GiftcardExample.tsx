import { useEffect, useRef, useState } from 'preact/hooks';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import Giftcard from '../../../src/components/Giftcard';
import Card from '../../../src/components/Card';
import { GiftCardConfiguration } from '../../../src/components/Giftcard/types';
import { PaymentMethodStoryProps } from '../types';

interface GiftcardExampleProps {
    contextArgs: PaymentMethodStoryProps<GiftCardConfiguration>;
}

export const GiftcardExample = ({ contextArgs }: GiftcardExampleProps) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const { useSessions, showPayButton, countryCode, shopperLocale, amount } = contextArgs;

        checkout.current = useSessions
            ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({
                  showPayButton,
                  countryCode,
                  shopperLocale,
                  amount
              });

        const onOrderUpdated = () => {
            const card = new Card(checkout.current, {
                _disableClickToPay: true
            });
            setElement(card);
        };

        const giftcardElement = new Giftcard(checkout.current, {
            ...contextArgs.componentConfiguration,
            onOrderUpdated: onOrderUpdated
        });
        setElement(giftcardElement);
    };

    useEffect(() => {
        void createCheckout();
    }, [contextArgs]);

    useEffect(() => {
        if (element?.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    element.mount(container.current);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else if (element) {
            element.mount(container.current);
        }
    }, [element]);

    return <div>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</div>;
};
