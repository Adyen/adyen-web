import { Fragment, h } from 'preact';
import { createSession, patchCheckoutSession } from '../../../helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../config/commonConfig';
import getCurrency from '../../../utils/get-currency';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, Core } from '../../../../src';
import { AmountUpdate } from './AmountUpdate';

import CardComponent from '../../../../src/components/Card/Card';
import GooglePayComponent from '../../../../src/components/GooglePay/GooglePay';
import AchComponent from '../../../../src/components/Ach/Ach';
import type { CheckoutSession, PaymentAmount } from '../../../../src/types';

const ComponentsDemo = ({ amount, countryCode, shopperLocale }) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const [updatedAmount, setAmount] = useState(amount);

    const requestSession = async () => {
        const session = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(updatedAmount)
            },
            shopperLocale,
            allowedPaymentMethods: ['scheme', 'applepay', 'googlepay', 'paypal', 'ach', 'cashapp'],
            countryCode,
            reference: 'SESSION-PATCHING',
            shopperReference: 'poc-session-patching-shopper',
            returnUrl: RETURN_URL,
            payable: false
        });

        setSession({ id: session.id, sessionData: session.sessionData });
    };

    const patchSession = async (amount: PaymentAmount, session: CheckoutSession): Promise<string> => {
        const response = await patchCheckoutSession(session.id, {
            sessionData: session.sessionData,
            amount,
            payable: true
        });

        setSession({ id: session.id, sessionData: response.sessionData });
        return response.sessionData;
    };

    useEffect(() => {
        if (!session) {
            void requestSession();
        }
    }, [session]);

    if (!session) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <AmountUpdate onUpdateAmount={(newAmount: string) => setAmount(Number(newAmount))} />
            <Checkout
                sessionId={session.id}
                sessionData={session.sessionData}
                countryCode={countryCode}
                amountValue={updatedAmount}
                onPatchSession={patchSession}
            />
        </Fragment>
    );
};

interface CheckoutProps {
    sessionId: string;
    sessionData: string;
    countryCode: string;
    amountValue: number;
    onPatchSession: (amount: PaymentAmount, session: CheckoutSession) => Promise<string>;
}

function Checkout({ sessionId, sessionData, countryCode, amountValue, onPatchSession }: CheckoutProps) {
    const checkoutRef = useRef<Core>(null);
    const [finalStatus, setFinalStatus] = useState<'success' | 'failed' | null>(null);

    const createComponents = async () => {
        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV as any,
            countryCode,
            session: {
                sessionData,
                id: sessionId
            },

            beforeSubmit: async (data, component, actions) => {
                try {
                    const { session } = component.core.session;
                    const { amount } = component.props;

                    const sessionData = await onPatchSession(amount, session);

                    actions.resolve({ ...data, sessionData });
                } catch (error) {
                    alert('beforeSubmit error');
                    actions.reject();
                }
            },

            onPaymentCompleted: (result, element) => {
                console.log('onPaymentCompleted', result, element);
                setFinalStatus('success');
            },

            onPaymentFailed: (result, element) => {
                console.log('onPaymentFailed', result, element);
                setFinalStatus('failed');
            },

            onError: (error, _component) => {
                if (error.name === 'CANCEL') return;

                alert('onError');
                console.log(error);
            },

            _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
        });
        checkoutRef.current = checkout;

        const card = new CardComponent(checkout, {
            showInstallmentAmounts: true,
            installmentOptions: {
                mc: {
                    values: [1, 2, 3]
                },
                visa: {
                    values: [1, 2, 3, 4],
                    plans: ['regular', 'revolving']
                }
            }
        });
        const googlepay = new GooglePayComponent(checkout);
        const ach = new AchComponent(checkout);

        card.mount('#card-container');
        ach.mount('#ach-container');
        googlepay.mount('#googlepay-container');
    };

    useEffect(() => {
        if (!checkoutRef.current) {
            void createComponents();
        }
    }, []);

    useEffect(() => {
        // If core exists, and amount changes, we perform an amount update
        if (checkoutRef.current) {
            const amount = {
                value: Number(amountValue),
                currency: getCurrency(countryCode)
            };

            const core = checkoutRef.current;
            void core.update({ amount }, { shouldReinitializeCheckout: false });
        }
    }, [amountValue, countryCode]);

    if (finalStatus) {
        const isSuccess = finalStatus === 'success';
        return (
            <div
                style={{
                    marginTop: '20px',
                    padding: '40px',
                    border: `1px solid ${isSuccess ? '#00a650' : '#d93025'}`,
                    borderRadius: '8px',
                    backgroundColor: isSuccess ? '#e6f4ea' : '#fce8e6',
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: isSuccess ? '#00a650' : '#d93025', marginBottom: '8px' }}>
                    {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                </div>
                <div style={{ color: '#001222' }}>
                    {isSuccess ? 'Your payment has been processed successfully.' : 'Something went wrong with your payment.'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #001222', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ margin: 'auto', maxWidth: '600px' }}>
                <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
                    Amount: {(amountValue / 100).toFixed(2)} {getCurrency(countryCode)}
                </div>
                <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <div style={{ marginBottom: '8px', fontWeight: '600', color: '#001222' }}>Card</div>
                    <div id="card-container"></div>
                </div>
                <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <div style={{ marginBottom: '8px', fontWeight: '600', color: '#001222' }}>ACH Direct Debit</div>
                    <div id="ach-container"></div>
                </div>
                <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <div style={{ marginBottom: '8px', fontWeight: '600', color: '#001222' }}>Google Pay</div>
                    <div id="googlepay-container"></div>
                </div>
            </div>
        </div>
    );
}

export { ComponentsDemo };
