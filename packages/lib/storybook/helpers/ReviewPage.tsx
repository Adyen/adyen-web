import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../src';
import type { CoreConfiguration, ICore } from '../../src/core/types';
import getCurrency from '../utils/get-currency';
import type { OrderStatus, PaymentData } from '../../src/types/global-types';

export interface ReviewPageProps {
    readonly reviewData: PaymentData;
    readonly sessionId: string;
    readonly orderStatus?: OrderStatus;
    readonly amount: string | number;
    readonly countryCode: string;
    readonly shopperLocale: string;
    readonly endDigits?: string;
}

export const ReviewPage = ({ reviewData, sessionId, orderStatus, amount, countryCode, shopperLocale, endDigits }: ReviewPageProps) => {
    const actionModalRef = useRef<HTMLDialogElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);
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
                    if (actionRef.current) actionElement.mount(actionRef.current);
                },
                onPaymentCompleted: result => {
                    actionModalRef.current?.close();
                    setSubmitting(false);
                    setResultCode(result.resultCode);
                },
                onPaymentFailed: result => {
                    setSubmitting(false);
                    setResultCode(result?.resultCode ?? 'Failed');
                }
            });
            checkoutRef.current = checkout;
            setCheckoutReady(true);
        };
        void init();
    }, []);

    return (
        <div data-testid="review-page" className="component-wrapper">
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
                    {endDigits && (
                        <p>
                            <strong>Card ending in:</strong> {endDigits}
                        </p>
                    )}
                    <pre style={{ overflow: 'auto', fontSize: 11 }}>{JSON.stringify(reviewData, null, 2)}</pre>
                    {orderStatus && (
                        <div>
                            <p>
                                <strong>Remaining amount:</strong> {(orderStatus.remainingAmount.value / 100).toFixed(2)}{' '}
                                {orderStatus.remainingAmount.currency}
                            </p>
                            <p>
                                <strong>Paid with:</strong>
                            </p>
                            <ul>
                                {orderStatus.paymentMethods.map((pm, i) => (
                                    <li key={i}>
                                        {pm.name ?? pm.type}
                                        {pm.lastFour ? ` •••• ${pm.lastFour}` : ''} — {(pm.amount.value / 100).toFixed(2)} {pm.amount.currency}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
        </div>
    );
};
