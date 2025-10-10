import { h } from "preact";
import { useEffect, useRef, useState } from 'preact/hooks';
import { createSessionsCheckout } from '../../../../storybook/helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../../../storybook/helpers/create-advanced-checkout';
import Giftcard from '..';
import Card from '../../Card';
import { GiftCardConfiguration } from '../types';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import Checkout from '../../../core/core';
import { UIElement } from '../../../types';

interface GiftcardExampleProps {
    contextArgs: PaymentMethodStoryProps<GiftCardConfiguration>;
    renderCard?: boolean; // Add a new prop to control which component to render
}

export const GiftcardExample = ({ contextArgs, renderCard = true }: GiftcardExampleProps) => {
    const container = useRef(null);
    const checkout = useRef<Checkout | null>(null);
    const [element, setElement] = useState<UIElement | null>(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [remainingAmount, setRemainingAmount] = useState('');

    const createCheckout = async () => {
        const { useSessions, showPayButton, countryCode, shopperLocale, amount, srConfig } = contextArgs;

        checkout.current = useSessions
            ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount, srConfig })
            : await createAdvancedFlowCheckout({
                  showPayButton,
                  countryCode,
                  shopperLocale,
                  amount,
                  srConfig
              });

        const onOrderUpdated = data => {
            setRemainingAmount(data.order?.remainingAmount?.value);
            if (renderCard && checkout.current) {
                const card = new Card(checkout.current, {
                    _disableClickToPay: true
                });
                setElement(card);
            } else if (checkout.current) {
                const giftcardElement = new Giftcard(checkout.current, {
                    ...contextArgs.componentConfiguration,
                    onOrderUpdated: onOrderUpdated
                });
                setElement(giftcardElement);
            }
        };

        const giftcardElement = new Giftcard(checkout.current, {
            ...contextArgs.componentConfiguration,
            onOrderUpdated: onOrderUpdated
        });
        setElement(giftcardElement);
    };

    useEffect(() => {
        void createCheckout();
    }, [contextArgs, renderCard]);

    useEffect(() => {
        if (element?.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    if (container.current) {
                        element.mount(container.current);
                    }                        
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else if (element) {
            if (container.current) {
                element.mount(container.current);
            }                        }
    }, [element]);

    return (
        <div>
            {errorMessage ? (
                <div>{errorMessage}</div>
            ) : (
                <div>
                    <div>Remaining amount: {remainingAmount}</div>
                    <div ref={container} id="component-root" className="component-wrapper" />
                </div>
            )}
        </div>
    );
};
