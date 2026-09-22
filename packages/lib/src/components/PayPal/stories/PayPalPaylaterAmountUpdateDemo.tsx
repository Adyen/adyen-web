import { Fragment, h, TargetedInputEvent, TargetedSubmitEvent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { createSession, patchCheckoutSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import getCurrency from '../../../../storybook/utils/get-currency';
import { AdyenCheckout, Core } from '../../../index';
import PayPalPaylaterElement from '../PayPalPaylater';

import type { CheckoutSession, CoreConfiguration, PaymentAmount } from '../../../types';
import styles from './PayPalPaylaterAmountUpdateDemo.module.scss';

/**
 * Amount the session is created with, in minor units. Large enough for PayPal to offer an instalment plan,
 * so that the messaging has something to show before the first update.
 */
const INITIAL_AMOUNT_VALUE = 2500;

/**
 * Demonstrates updating the amount of a live checkout, which is only possible in the sessions flow: the
 * session is created up front as non-payable and patched with the final amount right before the payment
 * is submitted, so the amount the shopper sees is the amount that gets charged.
 *
 * The update itself goes through 'core.update({ amount }, { shouldReinitializeCheckout: false })'. That
 * propagates the new amount to every mounted component through the AmountProvider without re-creating
 * them, and Pay Later reads it from there to re-fetch its messaging - so the offered instalment plan
 * follows the amount without the PayPal SDK instance being re-created.
 */
export function PayPalPaylaterAmountUpdateDemo({
    countryCode,
    shopperLocale
}: Readonly<{
    countryCode: string;
    shopperLocale: string;
}>) {
    const currency = getCurrency(countryCode);

    const [session, setSession] = useState<{ id: string; sessionData: string }>();
    const [paylater, setPaylater] = useState<PayPalPaylaterElement>();
    const [amountValue, setAmountValue] = useState(INITIAL_AMOUNT_VALUE);
    const [inputValue, setInputValue] = useState(String(INITIAL_AMOUNT_VALUE));

    const sessionRef = useRef<{ id: string; sessionData: string }>(null);
    const amountValueRef = useRef(INITIAL_AMOUNT_VALUE);
    const checkoutRef = useRef<Core>(null);

    const requestSession = async () => {
        const response = await createSession({
            amount: { currency, value: INITIAL_AMOUNT_VALUE },
            shopperLocale,
            countryCode,
            reference: 'paypal-paylater-amount-update',
            shopperReference: 'paypal-paylater-amount-update-shopper',
            returnUrl: RETURN_URL,
            splitPayPalButtons: true,
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

    const createPaylater = async () => {
        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
            countryCode,
            session: {
                id: session.id,
                sessionData: session.sessionData
            },

            beforeSubmit: async (data, component, actions) => {
                try {
                    // The amount is only picked on the client, so the session has to be patched with it before
                    // the payment is made. The ref holds the latest selection, since this callback is created once.
                    const sessionData = await patchSessionAndMakePayable({ currency, value: amountValueRef.current }, component.core.session.session);

                    actions.resolve({ ...data, sessionData });
                } catch (error) {
                    console.error('[PayPalPaylaterAmountUpdate] beforeSubmit session patch error', error);
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

        setPaylater(
            new PayPalPaylaterElement(checkout, {
                onAuthorized: (data, actions) => {
                    console.log('PayPal paylater onAuthorized data', { data });
                    actions.resolve();
                }
            })
        );
    };

    useEffect(() => {
        if (!session) {
            void requestSession();
        }
    }, [session]);

    useEffect(() => {
        if (session && !paylater) {
            void createPaylater();
        }
    }, [session, paylater]);

    useEffect(() => {
        amountValueRef.current = amountValue;

        // Propagates the amount to the mounted components without re-creating them
        void checkoutRef.current?.update({ amount: { currency, value: amountValue } }, { shouldReinitializeCheckout: false });
    }, [amountValue, currency]);

    // The amount is applied on submit rather than while typing, so that the messaging is not re-fetched on
    // every keystroke.
    const newAmountValue = Number(inputValue);
    const canApplyAmount = inputValue !== '' && newAmountValue > 0 && newAmountValue !== amountValue;

    const handleInput = (event: TargetedInputEvent<HTMLInputElement>) => {
        setInputValue(event.currentTarget.value.replace(/\D/g, ''));
    };

    const handleApplyAmount = (event: TargetedSubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canApplyAmount) return;

        setAmountValue(newAmountValue);
    };

    if (!session || !paylater) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <div className={styles.amountUpdatePanel}>
                <label className={styles.amountLabel} htmlFor="paylater-amount-input">
                    Amount in minor units, currently {(amountValue / 100).toFixed(2)} {currency}
                </label>
                <form className={styles.amountForm} onSubmit={handleApplyAmount}>
                    <input
                        id="paylater-amount-input"
                        className={styles.amountInput}
                        type="text"
                        inputMode="numeric"
                        value={inputValue}
                        onInput={handleInput}
                    />
                    <button className={styles.amountButton} type="submit" disabled={!canApplyAmount}>
                        Update amount
                    </button>
                </form>
                <div className={styles.amountHint}>The Pay Later messaging re-fetches its instalment plan for the updated amount.</div>
            </div>

            <ComponentContainer element={paylater} />
        </Fragment>
    );
}
