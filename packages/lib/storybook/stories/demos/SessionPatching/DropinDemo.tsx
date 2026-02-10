import { Fragment, h } from 'preact';
import { createSession, patchCheckoutSession } from '../../../helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../config/commonConfig';
import getCurrency from '../../../utils/get-currency';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components, Core } from '../../../../src';
import DropinComponent from '../../../../src/components/Dropin/Dropin';
import { AmountUpdate } from './AmountUpdate';
import type { CheckoutSession, PaymentAmount } from '../../../../src/types';

// Register all Components
const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);
AdyenCheckout.register(...Classes);

const DropinDemo = ({ amount, countryCode, shopperLocale }) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const [updatedAmount, setAmount] = useState(amount);

    const requestSession = async () => {
        const session = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(updatedAmount)
            },
            shopperLocale,
            allowedPaymentMethods: ['scheme', 'googlepay', 'ach', 'cashapp'],
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

    const createDropin = async () => {
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
            },

            onPaymentFailed: (result, element) => {
                console.log('onPaymentFailed', result, element);
            },

            onError: (error, _component) => {
                if (error.name === 'CANCEL') return;

                alert('onError');
                console.log(error);
            },

            _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
        });
        checkoutRef.current = checkout;

        const dropin = new DropinComponent(checkout);
        dropin.mount('#dropin-container');
    };

    useEffect(() => {
        if (!checkoutRef.current) {
            void createDropin();
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

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #001222', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ margin: 'auto', maxWidth: '600px' }}>
                <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
                    Amount: {(amountValue / 100).toFixed(2)} {getCurrency(countryCode)}
                </div>
                <div id="dropin-container"></div>
            </div>
        </div>
    );
}

export { DropinDemo };
