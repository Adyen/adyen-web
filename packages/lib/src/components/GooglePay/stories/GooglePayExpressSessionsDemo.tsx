import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import getCurrency from '../../../../storybook/utils/get-currency';
import { createSession, patchCheckoutSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import GooglePay from '../GooglePay';
import { AdyenCheckout } from '../../../core/AdyenCheckout';
import { createGooglePayAmountHelper, getShippingOptions, getTransactionInfo, EXPRESS_DEMO_SETTINGS } from './googlePayExpressUtils';
import { InfoBox } from './GooglePayExpressDemoInfo';
import type { PaymentAmount } from '../../../types/global-types';
import type { CheckoutSession, CoreConfiguration, GooglePayConfiguration } from '../../../types';

const GooglePayAmountHelper = createGooglePayAmountHelper(EXPRESS_DEMO_SETTINGS.INITIAL_AMOUNT);

const GOOGLE_PAY_EXPRESS_PROPS: GooglePayConfiguration = {
    isExpress: true,

    onAuthorized: (data, actions) => {
        console.log('Authorized data', data);
        actions.resolve();
    },

    transactionInfo: getTransactionInfo(),

    callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],

    paymentDataCallbacks: {
        async onPaymentDataChanged(intermediatePaymentData) {
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

            return paymentDataRequestUpdate;
        }
    },
    shippingAddressRequired: true,

    shippingAddressParameters: {
        phoneNumberRequired: true
    },

    shippingOptionRequired: true
};

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
                        currency: getCurrency(countryCode),
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

        const googlePay = new GooglePay(checkout, GOOGLE_PAY_EXPRESS_PROPS);

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
