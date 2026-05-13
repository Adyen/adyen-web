import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components } from '../../../..';
import type { CoreConfiguration, ICore } from '../../../../core/types';
import DropinComponent from '../../Dropin';
import getCurrency from '../../../../../storybook/utils/get-currency';
import { createSession } from '../../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE } from '../../../../../storybook/config/commonConfig';
import { handleFinalState } from '../../../../../storybook/helpers/checkout-handlers';
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { DropinConfiguration } from '../../types';
import Spinner from '../../../internal/Spinner';
import { PaymentData } from '../../../../types';

interface PaymentPageProps {
    readonly componentConfiguration: DropinConfiguration;
    readonly countryCode: string;
    readonly amount: string | number;
    readonly shopperLocale: string;
    readonly onReadyForReview: (data: PaymentData, sessionId: string) => void;
}

const PaymentPage = ({ componentConfiguration, countryCode, amount, shopperLocale, onReadyForReview }: PaymentPageProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dropin, setDropin] = useState<DropinComponent | null>(null);

    useEffect(() => {
        const { Dropin, ...Components } = components;
        AdyenCheckout.register(...Object.values(Components));

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
                onReadyForReview: data => {
                    onReadyForReview(data, session.id);
                },
                onError: (err: unknown) => console.error('[Option2] onError', err)
            });

            setDropin(new DropinComponent(checkout, componentConfiguration));
        };

        void init();
    }, []);

    useEffect(() => {
        if (dropin && wrapperRef.current) {
            dropin.mount(wrapperRef.current);
        }
        return () => {
            dropin?.unmount();
        };
    }, [dropin]);

    if (!dropin) {
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
    readonly amount: string | number;
    readonly countryCode: string;
    readonly shopperLocale: string;
}

const ReviewPage = ({ reviewData, sessionId, amount, countryCode, shopperLocale }: ReviewPageProps) => {
    const actionRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<ICore | null>(null);
    const [hideReviewPage, setHideReviewPage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            const reviewCheckout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
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
                }
            });
            checkoutRef.current = reviewCheckout;
        };

        void init();
    }, []);

    return (
        <div data-testid="review-page" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8, maxWidth: 500 }}>
            {!hideReviewPage && (
                <div>
                    <h2 style={{ marginTop: 0 }}>Review your order</h2>
                    <p>
                        <strong>Amount:</strong> {(Number(amount) / 100).toFixed(2)} {getCurrency(countryCode)}
                    </p>
                    <p>
                        <strong>Payment method:</strong> {reviewData.paymentMethod?.type}
                        {reviewData.paymentMethod?.brand ? ` (${reviewData.paymentMethod.brand})` : ''}
                    </p>
                    <div>Payment data</div>
                    <pre style={{ overflow: 'auto', fontSize: 11 }}>{JSON.stringify(reviewData, null, 2)}</pre>
                    <div style={{ marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={() => {
                                setSubmitting(true);
                                checkoutRef.current?.submitPayment(reviewData);
                            }}
                            disabled={submitting}
                            data-testid="review-confirm"
                            style={{ fontWeight: 600 }}
                        >
                            {submitting ? 'Processing…' : 'Place order'}
                        </button>
                    </div>
                </div>
            )}
            <div ref={actionRef} id="action-root" style={{ marginTop: 16 }} />
        </div>
    );
};

export const DropinWithReviewPageOnReadyForReview = (contextArgs: PaymentMethodStoryProps<DropinConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = contextArgs;
    const { countryCode, amount, shopperLocale } = checkoutConfig;

    const [reviewState, setReviewState] = useState<{ data: PaymentData | null; sessionId: string } | null>(null);

    if (reviewState) {
        return (
            <ReviewPage
                reviewData={reviewState.data}
                sessionId={reviewState.sessionId}
                amount={amount}
                countryCode={countryCode}
                shopperLocale={shopperLocale}
            />
        );
    }

    return (
        <PaymentPage
            componentConfiguration={componentConfiguration}
            countryCode={countryCode}
            amount={amount}
            shopperLocale={shopperLocale}
            onReadyForReview={(data, sessionId) => setReviewState({ data, sessionId })}
        />
    );
};
