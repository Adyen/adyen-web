import { Fragment, h } from 'preact';
import { Meta } from '@storybook/preact-vite';
import { createSession, patchCheckoutSession } from '../helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../config/commonConfig';
import getCurrency from '../utils/get-currency';
import { StoryConfiguration } from '../types';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components, Core } from '../../src';
import DropinComponent from '../../src/components/Dropin/Dropin';

// Register all Components
const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);
AdyenCheckout.register(...Classes);

type SessionPatchingStory = StoryConfiguration<{}>;

const meta: Meta<SessionPatchingStory> = {
    title: 'Demos/SessionPatchingOld'
};

export const Default: SessionPatchingStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <Demo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    }
};

const Demo = ({ amount, countryCode, shopperLocale }) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const [isSessionPatched, setIsSessionPatched] = useState(false);

    const requestSession = async () => {
        const session = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(amount)
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
            <AmountInputDispatch
                disabledPatch={isSessionPatched}
                sessionId={session.id}
                sessionData={session.sessionData}
                onSessionPatch={patchSession}
            />
            <Checkout sessionId={session.id} sessionData={session.sessionData} countryCode={countryCode} />
        </Fragment>
    );
};

function Checkout({ sessionId, sessionData, countryCode }) {
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
    };

    useEffect(() => {
        createDropin();
    }, [sessionData]);

    // If sessionData changes and checkout is already created, update it
    useEffect(() => {
        if (checkoutRef.current) {
            // TODO
        }
    }, [sessionData, checkoutRef.current]);

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>Dropin</h3>
            <div style={{ margin: 'auto', maxWidth: '600px' }} id="dropin-container"></div>
        </div>
    );
}

function AmountInputDispatch({ disabledPatch, sessionId, sessionData, onSessionPatch }) {
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        setMessage('Updating session...');

        try {
            await onSessionPatch(amount);
            setMessage(`✅ Success!`);
            setLoading(false);
        } catch (error) {
            setMessage('❌ Error: The network request failed. Please try again.');
            setLoading(false);
            console.error('Error patching session:', error);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', border: '1px solid #ced4da' }}>
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

            <hr style={{ borderColor: '#ced4da' }} />

            <h3>New Amount</h3>
            <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter new amount"
                disabled={loading || disabledPatch}
                style={{
                    padding: '10px',
                    marginRight: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    width: '200px'
                }}
            />

            {!disabledPatch && (
                <button
                    onClick={handleDispatchRequest}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: loading ? '#6c757d' : '#007bff',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Sending Request...' : 'Update amount'}
                </button>
            )}

            {message && (
                <p
                    style={{
                        marginTop: '10px',
                        fontWeight: 'bold',
                        color: message.startsWith('✅') ? 'green' : message.startsWith('❌') ? 'red' : 'orange'
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

export default meta;
