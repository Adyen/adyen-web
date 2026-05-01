import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import getCurrency from '../../../../storybook/utils/get-currency';
import { createSession, patchCheckoutSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import GooglePay from '../GooglePay';
import { AdyenCheckout } from '../../../core/AdyenCheckout';
import { createGooglePayAmountHelper, getShippingOptions, getTransactionInfo, EXPRESS_DEMO_SETTINGS } from './googlePayExpressUtils';
import type { PaymentAmount } from '../../../types/global-types';
import type { CheckoutSession, CoreConfiguration } from '../../../types';

const GooglePayAmountHelper = createGooglePayAmountHelper(EXPRESS_DEMO_SETTINGS.INITIAL_AMOUNT);

export function InfoBox() {
    return (
        <div
            style={{
                padding: '12px 16px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px'
            }}
        >
            <strong>Google Pay Express on Sessions Flow</strong>
            <br />
            <strong>About this story:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>
                    Country code is <code>BR</code> and currency is <code>BRL</code>.
                </li>
                <li>Initial amount is 100.00; shipping costs are added on top.</li>
                <li>Ships only to Brazil and the United States.</li>
                <li>Shipping options differ based on the selected country.</li>
            </ul>
        </div>
    );
}

export function GooglePayExpressSessionsDemo({
    amount,
    countryCode,
    shopperLocale
}: Readonly<{
    amount: number;
    countryCode: string;
    shopperLocale: string;
}>) {
    const [session, setSession] = useState<{ id: string; sessionData: string }>();
    const [googlePay, setGooglePay] = useState<GooglePay>();

    const requestSession = async () => {
        const response = await createSession({
            amount: {
                currency: getCurrency(countryCode),
                value: Number(amount)
            },
            shopperLocale,
            countryCode,
            reference: 'google-pay-express-sessions',
            shopperReference: 'google-pay-express-session-shopper',
            returnUrl: RETURN_URL,
            payable: false
        });

        setSession({ id: response.id, sessionData: response.sessionData });
    };

    const patchSessionAndMakePayable = async (newAmount: PaymentAmount, currentSession: CheckoutSession): Promise<string> => {
        const response = await patchCheckoutSession(currentSession.id, {
            sessionData: currentSession.sessionData,
            amount: newAmount,
            payable: true
        });

        setSession({ id: currentSession.id, sessionData: response.sessionData });
        return response.sessionData;
    };

    const createGooglePay = async () => {
        if (!session) {
            console.error('[GooglePayExpress] No session found');
            return;
        }

        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
            countryCode,
            session: {
                sessionData: session.sessionData,
                id: session.id
            },

            beforeSubmit: async (data, component, actions) => {
                try {
                    const { session } = component.core.session;

                    const amountToBePatched = {
                        currency: getCurrency(EXPRESS_DEMO_SETTINGS.COUNTRY_CODE),
                        value: GooglePayAmountHelper.getFinalAmount()
                    };

                    const sessionData = await patchSessionAndMakePayable(amountToBePatched, session);

                    actions.resolve({ ...data, sessionData });
                } catch (error) {
                    console.error('[GooglePayExpress] beforeSubmit session patch error', error);
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

        const googlePay = new GooglePay(checkout, {
            isExpress: true,

            onAuthorized: (data, actions) => {
                console.log('Authorized data', data);
                actions.resolve();
            },

            transactionInfo: getTransactionInfo(),

            callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],

            paymentDataCallbacks: {
                onPaymentDataChanged(intermediatePaymentData) {
                    // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
                    return new Promise(async resolve => {
                        const { callbackTrigger, shippingAddress, shippingOptionData } = intermediatePaymentData;
                        const paymentDataRequestUpdate: google.payments.api.PaymentDataRequestUpdate = {};

                        /** Validate country/address selection  **/
                        if (shippingAddress?.countryCode !== 'US' && shippingAddress?.countryCode !== 'BR') {
                            paymentDataRequestUpdate.error = {
                                reason: 'SHIPPING_ADDRESS_UNSERVICEABLE',
                                message: 'Cannot ship to the selected address',
                                intent: 'SHIPPING_ADDRESS'
                            };
                        }
                        /** If it initializes or changes the shipping address, we calculate the shipping options and transaction info  */
                        if (callbackTrigger === 'INITIALIZE' || callbackTrigger === 'SHIPPING_ADDRESS') {
                            if (shippingAddress?.countryCode) {
                                paymentDataRequestUpdate.newShippingOptionParameters = await getShippingOptions(shippingAddress.countryCode);

                                const selectedShippingOptionId =
                                    paymentDataRequestUpdate.newShippingOptionParameters?.defaultSelectedOptionId ||
                                    paymentDataRequestUpdate.newShippingOptionParameters.shippingOptions[0].id;

                                paymentDataRequestUpdate.newTransactionInfo = GooglePayAmountHelper.calculateNewTransactionInfo(
                                    shippingAddress.countryCode,
                                    selectedShippingOptionId
                                );
                            }
                        }
                        /** If SHIPPING_OPTION changed, we calculate the new fee */
                        if (callbackTrigger === 'SHIPPING_OPTION') {
                            if (shippingAddress?.countryCode && shippingOptionData?.id) {
                                paymentDataRequestUpdate.newTransactionInfo = GooglePayAmountHelper.calculateNewTransactionInfo(
                                    shippingAddress.countryCode,
                                    shippingOptionData.id
                                );
                            }
                        }

                        resolve(paymentDataRequestUpdate);
                    });
                }
            },
            shippingAddressRequired: true,

            shippingAddressParameters: {
                phoneNumberRequired: true
            },

            shippingOptionRequired: true
        });

        setGooglePay(googlePay);
    };

    useEffect(() => {
        if (!session) {
            void requestSession();
        }
    }, [session, requestSession]);

    useEffect(() => {
        if (session && !googlePay) {
            void createGooglePay();
        }
    }, [session, googlePay, createGooglePay]);

    if (!session || !googlePay) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <InfoBox />
            <ComponentContainer element={googlePay} />
        </Fragment>
    );
}
