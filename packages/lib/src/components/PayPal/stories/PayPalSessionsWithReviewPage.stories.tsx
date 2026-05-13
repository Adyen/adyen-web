import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { AdyenCheckout } from '../../..';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import Paypal from '..';
import type { PayPalConfiguration } from '../types';
import type { AdditionalDetailsData, CoreConfiguration } from '../../../core/types';
import Spinner from '../../internal/Spinner';
import { createSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import getCurrency from '../../../../storybook/utils/get-currency';
import { handleFinalState } from '../../../../storybook/helpers/checkout-handlers';
import { PaymentData } from '../../../types';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal',
    tags: ['no-automated-visual-test']
};
export default meta;

interface PaymentPageProps {
    readonly componentConfiguration: PayPalConfiguration;
    readonly countryCode: string;
    readonly amount: number;
    readonly shopperLocale: string;
    readonly onReadyForReview: (data: PaymentData | null, sessionId: string, additionalDetailsState: AdditionalDetailsData) => void;
}

const PaymentPage = ({ componentConfiguration, countryCode, amount, shopperLocale, onReadyForReview }: PaymentPageProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [paypal, setPaypal] = useState<Paypal | null>(null);

    useEffect(() => {
        const init = async () => {
            const session = await createSession({
                amount: { currency: getCurrency(countryCode), value: Number(amount) },
                shopperLocale,
                countryCode,
                reference: 'AAAAAA',
                returnUrl: RETURN_URL,
                shopperReference: SHOPPER_REFERENCE
            });

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session,
                onReadyForReview: (data, _component, additionalDetailsState) => {
                    onReadyForReview(data, session.id, additionalDetailsState);
                },
                onError: (err: unknown) => console.error(err),
                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            setPaypal(new Paypal(checkout, componentConfiguration));
        };

        void init();
    }, []);

    useEffect(() => {
        if (paypal && wrapperRef.current) {
            paypal.mount(wrapperRef.current);
        }
        return () => {
            paypal?.unmount();
        };
    }, [paypal]);

    if (!paypal) {
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
    readonly additionalDetailsState: AdditionalDetailsData;
    readonly sessionId: string;
    readonly componentConfiguration: PayPalConfiguration;
    readonly countryCode: string;
    readonly shopperLocale: string;
}

const ReviewPage = ({ reviewData, additionalDetailsState, sessionId, componentConfiguration, countryCode, shopperLocale }: ReviewPageProps) => {
    const paypalRef = useRef<Paypal | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [hideReviewPage, setHideReviewPage] = useState(false);
    useEffect(() => {
        const init = async () => {
            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session: { id: sessionId },
                onPaymentCompleted: (result, component) => {
                    setHideReviewPage(true);
                    setSubmitting(false);
                    handleFinalState(result, component);
                },
                onPaymentFailed: (result, component) => {
                    setHideReviewPage(true);
                    setSubmitting(false);
                    handleFinalState(result, component);
                },
                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            paypalRef.current = new Paypal(checkout, componentConfiguration);
        };

        void init();
    }, []);

    const confirmPayment = () => {
        setSubmitting(true);
        paypalRef.current?.handleAdditionalDetails(additionalDetailsState);
    };

    return (
        <div data-testid="review-page" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8, maxWidth: 500 }}>
            {!hideReviewPage && (
                <div>
                    <h2 style={{ marginTop: 0 }}>Review your order</h2>
                    <pre style={{ overflow: 'auto', fontSize: 11 }}>{JSON.stringify(reviewData, null, 2)}</pre>
                    <button type="button" data-testid="review-confirm" style={{ fontWeight: 600 }} onClick={confirmPayment}>
                        {submitting ? 'Processing…' : 'Place order'}
                    </button>
                </div>
            )}
            <div id="component-root" />
        </div>
    );
};

export const SessionsWithReviewPage: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const { countryCode, amount, shopperLocale } = checkoutConfig;
        const [reviewState, setReviewState] = useState<{
            data: PaymentData | null;
            additionalDetailsState: AdditionalDetailsData;
            sessionId: string;
        } | null>(null);

        if (reviewState) {
            return (
                <ReviewPage
                    reviewData={reviewState.data}
                    additionalDetailsState={reviewState.additionalDetailsState}
                    sessionId={reviewState.sessionId}
                    componentConfiguration={componentConfiguration}
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
                onReadyForReview={(data, sessionId, additionalDetailsState) => setReviewState({ data, sessionId, additionalDetailsState })}
            />
        );
    },
    args: {
        componentConfiguration: {
            blockPayPalCreditButton: false,
            blockPayPalPayLaterButton: false,
            blockPayPalVenmoButton: false,
            userAction: 'continue',
            onAuthorized: (data, actions) => {
                console.log({ data });
                setTimeout(() => {
                    actions.resolve();
                }, 3000);
            }
        }
    }
};
