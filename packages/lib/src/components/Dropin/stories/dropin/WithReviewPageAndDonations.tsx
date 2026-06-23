import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components, Donation } from '../../../..';
import type { CoreConfiguration, ICore } from '../../../../core/types';
import DropinComponent from '../../Dropin';
import getCurrency from '../../../../../storybook/utils/get-currency';
import { createSession } from '../../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE } from '../../../../../storybook/config/commonConfig';
import type { StoryConfiguration } from '../../../../../storybook/types';
import type { DropinConfiguration } from '../../types';
import type { Order, PaymentData } from '../../../../types/global-types';
import type { NewableComponent } from '../../../../core/core.registry';
import type { CheckoutSessionDonationCampaignsResponse } from '../../../../core/CheckoutSession/types';

type DropinStory = StoryConfiguration<DropinConfiguration>;

interface PaymentPageProps {
    readonly componentConfiguration: DropinConfiguration;
    readonly countryCode: string;
    readonly amount: string | number;
    readonly shopperLocale: string;
    readonly onReview: (data: PaymentData, sessionId: string) => void;
    readonly existingSessionId?: string;
    readonly existingOrder?: Order;
}

const PaymentPage = ({
    componentConfiguration,
    countryCode,
    amount,
    shopperLocale,
    onReview,
    existingSessionId,
    existingOrder
}: PaymentPageProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const { Dropin, ...Components } = components;
        AdyenCheckout.register(...(Object.values(Components) as NewableComponent[]));

        const init = async () => {
            let sessionId: string;
            let session: { id: string; sessionData?: string };

            if (existingSessionId) {
                sessionId = existingSessionId;
                session = { id: existingSessionId };
            } else {
                const newSession = await createSession({
                    amount: { currency: getCurrency(countryCode), value: Number(amount) },
                    shopperLocale,
                    countryCode,
                    reference: 'ABC123',
                    returnUrl: RETURN_URL,
                    shopperReference: SHOPPER_REFERENCE
                });
                sessionId = newSession.id;
                session = newSession;
            }

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session,
                ...(existingOrder && { order: existingOrder }),
                onReview: data => onReview(data, sessionId),
                onError: (err: unknown) => console.error('[WithReviewPageAndDonations] onError', err)
            });

            new DropinComponent(checkout, componentConfiguration).mount(wrapperRef.current);
        };

        void init();
    }, []);

    return <div ref={wrapperRef} />;
};

interface ReviewPageProps {
    readonly reviewData: PaymentData;
    readonly sessionId: string;
    readonly amount: string | number;
    readonly countryCode: string;
    readonly shopperLocale: string;
    readonly onOrderUpdated?: (order: Order, sessionId: string) => void;
}

const ReviewPage = ({ reviewData, sessionId, amount, countryCode, shopperLocale, onOrderUpdated }: ReviewPageProps) => {
    const actionModalRef = useRef<HTMLDialogElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);
    const donationRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<ICore | null>(null);
    const [checkoutReady, setCheckoutReady] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resultCode, setResultCode] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                locale: shopperLocale,
                session: { id: sessionId },
                onAction: actionElement => {
                    actionModalRef.current?.showModal();
                    actionElement.mount(actionRef.current);
                },
                onPaymentCompleted: result => {
                    actionModalRef.current?.close();
                    setSubmitting(false);
                    setResultCode(result.resultCode);
                    if (donationRef.current && checkoutRef.current) {
                        new Donation(checkoutRef.current, {
                            rootNode: donationRef.current,
                            commercialTxAmount: Number(amount)
                        });
                    }
                },
                onOrderUpdated: result => {
                    setSubmitting(false);
                    onOrderUpdated?.(result.order, sessionId);
                },
                onPaymentFailed: result => {
                    setSubmitting(false);
                    setResultCode(result?.resultCode ?? 'Failed');
                },
                donation: {
                    autoMount: false,
                    onDonationSuccess: ({ didDonate }) => console.log('[ReviewPage] Donation completed, didDonate:', didDonate),
                    onDonationFailure: reason => console.error('[ReviewPage] Donation failed:', reason)
                }
            });

            const session = checkout.session;
            if (session) {
                session.fetchDonationCampaigns = (): Promise<CheckoutSessionDonationCampaignsResponse> =>
                    Promise.resolve({
                        sessionData: session.data,
                        donationCampaigns: [
                            {
                                id: 'roundup-campaign-1',
                                campaignName: 'Roundup Campaign',
                                nonprofitName: 'Adyen Giving',
                                donation: { type: 'roundup', currency: getCurrency(countryCode), maxRoundupAmount: 500 }
                            }
                        ]
                    });
            }

            checkoutRef.current = checkout;
            setCheckoutReady(true);
        };

        void init();
    }, []);

    return (
        <div data-testid="review-page" style={{ maxWidth: 500 }}>
            {!resultCode && (
                <div>
                    <h2>Review your order</h2>
                    <p>
                        <strong>Amount:</strong> {(Number(amount) / 100).toFixed(2)} {getCurrency(countryCode)}
                    </p>
                    <p>
                        <strong>Payment method:</strong> {reviewData.paymentMethod?.type}
                        {reviewData.paymentMethod?.brand ? ` (${reviewData.paymentMethod.brand})` : ''}
                    </p>
                    <pre style={{ overflow: 'auto', fontSize: 11 }}>{JSON.stringify(reviewData, null, 2)}</pre>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmitting(true);
                            checkoutRef.current?.processPayment(reviewData);
                        }}
                        disabled={!checkoutReady || submitting}
                        data-testid="review-confirm"
                    >
                        {submitting ? 'Processing…' : 'Place order'}
                    </button>
                </div>
            )}
            {resultCode && (
                <p data-testid="result-message">
                    <strong>Result:</strong> {resultCode}
                </p>
            )}
            <dialog ref={actionModalRef}>
                <div ref={actionRef} />
            </dialog>
            <div ref={donationRef} />
        </div>
    );
};

export const WithReviewPageAndDonations: DropinStory = {
    args: { countryCode: 'NL', useSessions: true },
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const { countryCode, amount, shopperLocale } = checkoutConfig;
        const [reviewState, setReviewState] = useState<{ data: PaymentData; sessionId: string } | null>(null);
        const [orderReturn, setOrderReturn] = useState<{ order: Order; sessionId: string } | null>(null);

        if (reviewState) {
            return (
                <ReviewPage
                    reviewData={reviewState.data}
                    sessionId={reviewState.sessionId}
                    amount={amount}
                    countryCode={countryCode}
                    shopperLocale={shopperLocale}
                    onOrderUpdated={(order, sessionId) => {
                        setOrderReturn({ order, sessionId });
                        setReviewState(null);
                    }}
                />
            );
        }

        return (
            <PaymentPage
                componentConfiguration={componentConfiguration}
                countryCode={countryCode}
                amount={amount}
                shopperLocale={shopperLocale}
                onReview={(data, sessionId) => setReviewState({ data, sessionId })}
                existingSessionId={orderReturn?.sessionId}
                existingOrder={orderReturn?.order}
            />
        );
    }
};
