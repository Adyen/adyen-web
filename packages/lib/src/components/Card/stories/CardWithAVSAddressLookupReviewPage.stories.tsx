import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { AdyenCheckout } from '../../..';
import type { CoreConfiguration, ICore } from '../../../core/types';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import Card from '../Card';
import type { CardConfiguration } from '../types';
import Spinner from '../../internal/Spinner';
import { createSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import getCurrency from '../../../../storybook/utils/get-currency';
import { handleFinalState } from '../../../../storybook/helpers/checkout-handlers';
import { searchFunctionExample } from '../../../../../playground/src/utils';
import { CardFieldValidData, PaymentData } from '../../../types';

type Story = StoryObj<PaymentMethodStoryProps<CardConfiguration>>;

const meta: Meta = {
    title: 'Components/Cards',
    tags: ['no-automated-visual-test']
};
export default meta;

interface PaymentPageProps {
    readonly componentConfiguration: CardConfiguration;
    readonly countryCode: string;
    readonly amount: number;
    readonly shopperLocale: string;
    readonly onReadyForReview: (data: PaymentData, sessionId: string, endDigits: string) => void;
}

const PaymentPage = ({ componentConfiguration, countryCode, amount, shopperLocale, onReadyForReview }: PaymentPageProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [card, setCard] = useState<Card | null>(null);
    const endDigitsRef = useRef<string>('');

    useEffect(() => {
        const init = async () => {
            const session = await createSession({
                amount: { currency: getCurrency(countryCode), value: Number(amount) },
                shopperLocale,
                countryCode,
                reference: 'ABC123',
                returnUrl: RETURN_URL,
                shopperReference: SHOPPER_REFERENCE
            });

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session,
                onReadyForReview: data => {
                    onReadyForReview(data, session.id, endDigitsRef.current);
                },
                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            setCard(
                new Card(checkout, {
                    ...componentConfiguration,
                    onFieldValid: (callbackObj: CardFieldValidData) => {
                        if (callbackObj.fieldType === 'encryptedCardNumber' && callbackObj.endDigits) {
                            endDigitsRef.current = callbackObj.endDigits;
                        }
                    }
                })
            );
        };

        void init();
    }, []);

    useEffect(() => {
        if (card && wrapperRef.current) {
            card.mount(wrapperRef.current);
        }
        return () => {
            card?.unmount();
        };
    }, [card]);

    if (!card) {
        return (
            <div data-testid="checkout-component-spinner">
                <Spinner />
            </div>
        );
    }

    return (
        <div data-testid="checkout-component">
            <div ref={wrapperRef} id="component-root" className="component-wrapper" />
        </div>
    );
};

interface ReviewPageProps {
    readonly reviewData: PaymentData | null;
    readonly sessionId: string;
    readonly endDigits: string;
    readonly countryCode: string;
    readonly shopperLocale: string;
}

const ReviewPage = ({ reviewData, sessionId, endDigits, countryCode, shopperLocale }: ReviewPageProps) => {
    const actionRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<ICore | null>(null);
    const [hideReviewPage, setHideReviewPage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session: { id: sessionId },
                onAction: actionElement => {
                    if (actionRef.current) {
                        setHideReviewPage(true);
                        actionElement.mount(actionRef.current);
                    }
                },
                onPaymentCompleted: (result, component) => {
                    setSubmitting(false);
                    handleFinalState(result, component);
                },
                onPaymentFailed: (result, component) => {
                    setSubmitting(false);
                    handleFinalState(result, component);
                },
                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            checkoutRef.current = checkout;
        };

        void init();
    }, []);

    const billingAddress = reviewData?.billingAddress;

    return (
        <div data-testid="review-page" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8, maxWidth: 500 }}>
            {!hideReviewPage && (
                <div>
                    <h2 style={{ marginTop: 0 }}>Review your order</h2>
                    <p>
                        <strong>Card:</strong> {reviewData?.paymentMethod?.brand ?? reviewData?.paymentMethod?.type}
                        {endDigits && <span> •••• {endDigits}</span>}
                    </p>
                    {billingAddress && (
                        <div>
                            <strong>Billing address:</strong>
                            <p style={{ margin: '4px 0' }}>
                                {billingAddress.houseNumberOrName} {billingAddress.street}
                                <br />
                                {billingAddress.city}, {billingAddress.stateOrProvince} {billingAddress.postalCode}
                                <br />
                                {billingAddress.country}
                            </p>
                        </div>
                    )}
                    <button
                        type="button"
                        data-testid="review-confirm"
                        style={{ fontWeight: 600, marginTop: 16 }}
                        disabled={submitting}
                        onClick={() => {
                            setSubmitting(true);
                            checkoutRef.current?.submitPayment(reviewData);
                        }}
                    >
                        {submitting ? 'Processing…' : 'Place order'}
                    </button>
                </div>
            )}
            <div id="component-root" />
            <div ref={actionRef} id="action-root" style={{ marginTop: 16 }} />
        </div>
    );
};

export const WithAVSAddressLookupReviewPage: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const { countryCode, amount, shopperLocale } = checkoutConfig;
        const [reviewState, setReviewState] = useState<{ data: PaymentData | null; sessionId: string; endDigits: string } | null>(null);

        if (reviewState) {
            return (
                <ReviewPage
                    reviewData={reviewState.data}
                    sessionId={reviewState.sessionId}
                    countryCode={countryCode}
                    shopperLocale={shopperLocale}
                    endDigits={reviewState.endDigits}
                />
            );
        }

        return (
            <PaymentPage
                componentConfiguration={componentConfiguration}
                countryCode={countryCode}
                amount={amount}
                shopperLocale={shopperLocale}
                onReadyForReview={(data, sessionId, endDigits) => setReviewState({ data, sessionId, endDigits })}
            />
        );
    },
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            onAddressLookup: searchFunctionExample
        }
    }
};
