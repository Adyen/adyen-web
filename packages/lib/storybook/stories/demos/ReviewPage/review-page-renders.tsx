import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components } from '../../../../src';
import type { CoreConfiguration, ICore } from '../../../../src/core/types';
import type { OrderStatus, PaymentData } from '../../../../src/types/global-types';
import type { CardFieldValidData } from '../../../../src/types';
import type { NewableComponent } from '../../../../src/core/core.registry';
import type { DropinConfiguration } from '../../../../src/components/Dropin/types';
import type { CardConfiguration } from '../../../../src/components/Card/types';
import type { PaymentMethodStoryProps } from '../../../types';
import { ReviewPage } from './ReviewPage';
import { createSession } from '../../../helpers/checkout-api-calls';
import getCurrency from '../../../utils/get-currency';
import { RETURN_URL, SHOPPER_REFERENCE } from '../../../config/commonConfig';
import DropinComponent from '../../../../src/components/Dropin/Dropin';
import Card from '../../../../src/components/Card/Card';

type MountFn<T> = (el: HTMLDivElement, checkout: ICore, config: T, endDigitsRef: { current: string | undefined }) => void;

const captureEndDigits = (endDigitsRef: { current: string | undefined }) => (e: CardFieldValidData) => {
    if (e.fieldType === 'encryptedCardNumber' && e.endDigits) {
        endDigitsRef.current = e.endDigits;
    }
};

function createReviewPageRender<T>(mountFn: MountFn<T>) {
    return function ReviewPageStory({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<T>) {
        const { countryCode, amount, shopperLocale } = checkoutConfig;
        const [reviewState, setReviewState] = useState<{ data: PaymentData; sessionId: string; orderStatus?: OrderStatus } | null>(null);
        const endDigitsRef = useRef<string | undefined>(undefined);
        const wrapperRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const init = async () => {
                const session = await createSession({
                    amount: { currency: getCurrency(countryCode), value: Number(amount) },
                    shopperLocale,
                    countryCode,
                    reference: 'ABC123',
                    returnUrl: RETURN_URL,
                    shopperReference: SHOPPER_REFERENCE,
                    shopperEmail: 'shopper.ctp1@adyen.com'
                });

                const checkout = await AdyenCheckout({
                    clientKey: process.env.CLIENT_KEY,
                    environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                    countryCode,
                    locale: shopperLocale,
                    session,
                    onReview: (data, _component, { orderStatus }) => setReviewState({ data, sessionId: session.id, orderStatus }),
                    onError: (err: unknown) => console.error('[ReviewPage] onError', err)
                });

                if (wrapperRef.current) {
                    mountFn(wrapperRef.current, checkout, componentConfiguration, endDigitsRef);
                }
            };
            void init();
        }, []);

        if (reviewState) {
            return (
                <ReviewPage
                    reviewData={reviewState.data}
                    sessionId={reviewState.sessionId}
                    orderStatus={reviewState.orderStatus}
                    amount={amount}
                    countryCode={countryCode}
                    shopperLocale={shopperLocale}
                    endDigits={endDigitsRef.current}
                />
            );
        }

        return <div ref={wrapperRef} className="component-wrapper" />;
    };
}

export const renderDropinReviewPage = createReviewPageRender<DropinConfiguration>((el, checkout, config, endDigitsRef) => {
    const { Dropin, ...Components } = components;
    AdyenCheckout.register(...(Object.values(Components) as NewableComponent[]));
    new DropinComponent(checkout, {
        ...config,
        paymentMethodsConfiguration: {
            ...config?.paymentMethodsConfiguration,
            card: { ...config?.paymentMethodsConfiguration?.card, onFieldValid: captureEndDigits(endDigitsRef) }
        }
    }).mount(el);
});

export const renderCardReviewPage = createReviewPageRender<CardConfiguration>((el, checkout, config, endDigitsRef) => {
    new Card(checkout, { ...config, onFieldValid: captureEndDigits(endDigitsRef) }).mount(el);
});
