import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { createSession, patchCheckoutSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import getCurrency from '../../../../storybook/utils/get-currency';
import { AdyenCheckout, Core } from '../../../index';
import ApplePay from '../ApplePay';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import type { CheckoutSession, PaymentAmount } from '../../../types';
import styles from './ApplePayCouponCodeDemo.module.scss';

const VALID_COUPON = 'BONUS20';
const DISCOUNT_PERCENTAGE = 20;

interface ApplePayCouponCodeDemoProps {
    amount: number;
    countryCode: string;
    shopperLocale: string;
}

const ApplePayCouponCodeDemo = ({ amount, countryCode, shopperLocale }: Readonly<ApplePayCouponCodeDemoProps>) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const sessionRef = useRef<{ id: string; sessionData: string }>(null);
    const currentAmountRef = useRef(amount);
    const [currentAmount, setCurrentAmount] = useState(amount);
    const [couponCode, setCouponCode] = useState('');
    const couponCodeRef = useRef('');
    const checkoutRef = useRef<Core>(null);
    const applePayRef = useRef<ApplePay>(null);

    const requestSession = async () => {
        const response = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(amount)
            },
            shopperLocale,
            countryCode,
            reference: 'APPLEPAY-COUPON-SESSION-PATCHING',
            shopperReference: 'poc-session-patching-shopper',
            returnUrl: RETURN_URL,
            payable: false
        });

        sessionRef.current = { id: response.id, sessionData: response.sessionData };
        setSession(sessionRef.current);
    };

    const patchSessionAndMakePayable = async (newAmount: PaymentAmount, currentSession: CheckoutSession): Promise<string> => {
        const response = await patchCheckoutSession(currentSession.id, {
            sessionData: currentSession.sessionData,
            amount: newAmount,
            payable: true
        });

        sessionRef.current = { id: currentSession.id, sessionData: response.sessionData };
        setSession(sessionRef.current);
        return response.sessionData;
    };

    useEffect(() => {
        if (!session) {
            void requestSession();
        }
    }, [session]);

    const createApplePay = async () => {
        const currency = getCurrency(countryCode);

        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV as any,
            countryCode,
            session: {
                sessionData: session.sessionData,
                id: session.id
            },

            beforeSubmit: async (data, _component, actions) => {
                try {
                    const finalAmount =
                        couponCodeRef.current === VALID_COUPON
                            ? { value: Math.round(amount * (1 - DISCOUNT_PERCENTAGE / 100)), currency }
                            : { value: amount, currency };

                    const sessionData = await patchSessionAndMakePayable(finalAmount, sessionRef.current);

                    actions.resolve({ ...data, sessionData });
                } catch (error) {
                    console.error('beforeSubmit session patch error', error);
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
                console.error('onError', error);
            },

            _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
        });

        checkoutRef.current = checkout;

        applePayRef.current = new ApplePay(checkout, {
            buttonColor: 'black',
            renderApplePayCodeAs: 'modal',
            couponCode,
            supportsCouponCode: true,
            onCouponCodeChange: (resolve, reject, event) => {
                const newCouponCode = (event.couponCode ?? '').trim();

                if (newCouponCode === VALID_COUPON) {
                    const discountedValue = Math.round(amount * (1 - DISCOUNT_PERCENTAGE / 100));

                    currentAmountRef.current = discountedValue;
                    setCurrentAmount(discountedValue);
                    setCouponCode(newCouponCode);
                    couponCodeRef.current = newCouponCode;

                    resolve({
                        newTotal: { label: 'Total', amount: String(discountedValue / 100) }
                    });
                } else if (newCouponCode === '') {
                    currentAmountRef.current = amount;
                    setCurrentAmount(amount);
                    setCouponCode('');
                    couponCodeRef.current = '';

                    resolve({
                        newTotal: { label: 'Total', amount: String(amount / 100) }
                    });
                } else {
                    reject({
                        newTotal: { label: 'Total', amount: String(currentAmountRef.current / 100), type: 'final' }
                    });
                }
            }
        });

        return applePayRef.current;
    };

    useEffect(() => {
        applePayRef.current?.update({
            couponCode
        });
    }, [couponCode]);

    if (!session) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <div className={styles.couponInfo}>
                <div className={styles.amountLabel}>
                    Amount: {(currentAmount / 100).toFixed(2)} {getCurrency(countryCode)}
                </div>
                <div className={styles.couponHint}>
                    Use coupon code <strong>{VALID_COUPON}</strong> for a {DISCOUNT_PERCENTAGE}% discount
                </div>
            </div>
            <ApplePayCheckout session={session} countryCode={countryCode} createApplePay={createApplePay} />
        </Fragment>
    );
};

interface ApplePayCheckoutProps {
    session: { id: string; sessionData: string };
    countryCode: string;
    createApplePay: () => Promise<ApplePay>;
}

function ApplePayCheckout({ session, createApplePay }: Readonly<ApplePayCheckoutProps>) {
    const [applePay, setApplePay] = useState<ApplePay>(null);

    useEffect(() => {
        void createApplePay().then(setApplePay);
    }, [session]);

    return <ComponentContainer element={applePay} />;
}

export { ApplePayCouponCodeDemo };
