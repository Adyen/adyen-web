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

const ApplePayCouponCodeDemo = ({ amount, countryCode, shopperLocale }: ApplePayCouponCodeDemoProps) => {
    const [session, setSession] = useState<{ id: string; sessionData: string }>(null);
    const currentAmountRef = useRef(amount);
    const [currentAmount, setCurrentAmount] = useState(amount);
    const checkoutRef = useRef<Core>(null);

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

        setSession({ id: response.id, sessionData: response.sessionData });
    };

    const patchSessionAmount = async (newAmount: PaymentAmount, checkoutSession: CheckoutSession): Promise<string> => {
        const response = await patchCheckoutSession(checkoutSession.id, {
            sessionData: checkoutSession.sessionData,
            amount: newAmount,
            payable: false
        });

        setSession({ id: checkoutSession.id, sessionData: response.sessionData });
        return response.sessionData;
    };

    const patchSessionPayable = async (paymentAmount: PaymentAmount, checkoutSession: CheckoutSession): Promise<string> => {
        const response = await patchCheckoutSession(checkoutSession.id, {
            sessionData: checkoutSession.sessionData,
            amount: paymentAmount,
            payable: true
        });

        setSession({ id: checkoutSession.id, sessionData: response.sessionData });
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

            beforeSubmit: async (data, component, actions) => {
                try {
                    const { session: checkoutSession } = component.core.session;
                    const { amount: paymentAmount } = component.props;

                    const sessionData = await patchSessionPayable(paymentAmount, checkoutSession);

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

        return new ApplePay(checkout, {
            buttonColor: 'black',
            renderApplePayCodeAs: 'modal',
            couponCode: '',
            supportsCouponCode: true,
            onCouponCodeChange: (resolve, reject, event) => {
                const couponCode = event.couponCode;

                if (couponCode !== VALID_COUPON) {
                    currentAmountRef.current = amount;
                    setCurrentAmount(amount);
                    reject({
                        newTotal: { label: 'Total', amount: String(amount / 100), type: 'final' }
                    });
                    return;
                }

                const discountedValue = Math.round(amount * (1 - DISCOUNT_PERCENTAGE / 100));
                const newAmount = { value: discountedValue, currency };
                const { session: checkoutSession } = checkoutRef.current.session;

                void patchSessionAmount(newAmount, checkoutSession)
                    .then(() => {
                        currentAmountRef.current = discountedValue;
                        setCurrentAmount(discountedValue);

                        void checkoutRef.current.update(
                            {
                                amount: newAmount
                            },
                            {
                                shouldReinitializeCheckout: false
                            }
                        );

                        resolve({
                            newTotal: {
                                label: 'Total',
                                amount: String(discountedValue / 100)
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Coupon code session patch error', error);
                        reject({
                            newTotal: { label: 'Total', amount: String(amount / 100), type: 'final' }
                        });
                    });
            }
        });
    };

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
