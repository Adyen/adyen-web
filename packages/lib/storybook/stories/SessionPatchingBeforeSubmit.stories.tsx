import { Fragment, h } from 'preact';
import { Meta } from '@storybook/preact-vite';
import { createSession, patchCheckoutSession } from '../helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../config/commonConfig';
import getCurrency from '../utils/get-currency';
import { StoryConfiguration } from '../types';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components, Core } from '../../src';
import DropinComponent from '../../src/components/Dropin/Dropin';
import CardComponent from '../../src/components/Card/Card';

// Register all Components
const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);
AdyenCheckout.register(...Classes);

type SessionPatchingStory = StoryConfiguration<{}>;

const meta: Meta<SessionPatchingStory> = {
    title: 'Demos/SessionPatchingBeforeSubmit'
};

export const Default: SessionPatchingStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <Demo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    }
};

const Demo = ({ amount, countryCode, shopperLocale }) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const [updatedAmount, setAmount] = useState(amount);
    const [isSessionPatched, setIsSessionPatched] = useState(false);

    const requestSession = async () => {
        const session = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(updatedAmount)
            },
            shopperLocale,
            countryCode,
            reference: 'ABC123',
            shopperReference: 'poc-session-patching-shopper',
            returnUrl: RETURN_URL,
            payable: false
        });

        setSession({ id: session.id, sessionData: session.sessionData });
    };

    const patchSession = async () => {
        const response = await patchCheckoutSession(session.id, {
            sessionData: session.sessionData,
            amount: {
                currency: getCurrency(countryCode),
                value: Number(amount)
            },
            payable: true
        });

        setSession({ id: session.id, sessionData: response.sessionData });
        setIsSessionPatched(true);
    };

    useEffect(() => {
        if (!session) {
            requestSession();
        }
    }, [session]);

    if (!session) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <CheckoutSessionOverview sessionId={session.id} sessionData={session.sessionData} />
            <AmountUpdate onUpdateAmount={(newAmount: string) => setAmount(newAmount)} />
            <Checkout sessionId={session.id} sessionData={session.sessionData} countryCode={countryCode} amountValue={updatedAmount} />
        </Fragment>
    );
};

function Checkout({ sessionId, sessionData, countryCode, amountValue }) {
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

            beforeSubmit: (data, component, actions) => {
                actions.resolve(data);
            },

            onPaymentCompleted(result, element) {
                console.log('onPaymentCompleted', result, element);
                alert('onPaymentCompleted');
            },

            onPaymentFailed(result, element) {
                console.log('onPaymentFailed', result, element);
                alert('onPaymentFailed');
            },

            onError: (error, component) => {
                alert('onError');
            },

            _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
        });
        checkoutRef.current = checkout;

        const dropin = new DropinComponent(checkout);
        dropin.mount('#dropin-container');

        console.log('component', dropin);
    };

    useEffect(() => {
        if (!checkoutRef.current) {
            createDropin();
        }
    }, []);

    useEffect(() => {
        // If core exists, and amount changes, we perform an amount update
        if (checkoutRef.current) {
            const amount = {
                value: Number(amountValue),
                currency: 'EUR'
            };

            checkoutRef.current.update({ amount }, { shouldRecreateDomElements: false });
        }
    }, [amountValue]);

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ margin: 'auto', maxWidth: '600px' }} id="dropin-container"></div>
        </div>
    );
}

function CheckoutSessionOverview({ sessionId, sessionData }) {
    return (
        <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', border: '1px solid #ced4da' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                    Current Session ID:
                    <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>{sessionId || 'N/A'}</code>
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Session Data (Last 50 Chars):
                    <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px', wordBreak: 'break-all' }}>
                        ...${sessionData.slice(-50)}
                    </code>
                </p>
            </div>
        </div>
    );
}

function AmountUpdate({ onUpdateAmount }) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleAmountChange = event => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
        setMessage('');
    };

    const handleDispatchRequest = async () => {
        if (amount === '' || isNaN(parseFloat(amount))) {
            setMessage('⚠️ Please enter a valid number for the amount.');
            return;
        }

        onUpdateAmount(amount);
        setMessage('✅ Success!');
        setAmount('');
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa', display: 'flex' }}>
            <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter new amount"
                style={{
                    padding: '10px',
                    marginRight: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    width: '200px'
                }}
            />

            <button
                onClick={handleDispatchRequest}
                style={{
                    padding: '10px 15px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                Update amount
            </button>

            {message && (
                <div
                    style={{
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        marginLeft: '20px',
                        fontWeight: 'bold',
                        color: message.startsWith('✅') ? 'green' : message.startsWith('❌') ? 'red' : 'orange'
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}

export default meta;
