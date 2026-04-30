import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import getCurrency from '../../../../storybook/utils/get-currency';
import { createSession, patchCheckoutSession } from '../../../../storybook/helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../../storybook/config/commonConfig';
import GooglePay from '../GooglePay';
import { AdyenCheckout } from '../../../core/AdyenCheckout';

import type { GooglePayConfiguration } from '../types';
import type { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import type { PaymentAmount } from '../../../types/global-types';
import type { CheckoutSession, CoreConfiguration } from '../../../types';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const COUNTRY_CODE = 'BR';
const SHOPPER_LOCALE = 'en-US';
const INITIAL_AMOUNT = 10000;

let finalAmount = INITIAL_AMOUNT;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Components/Wallets/GooglePay',
    tags: ['no-automated-visual-test']
};

type ShippingCosts = Record<string, string>;

/**
 * Method that calculate the shipping costs based on the country/shipping options
 *
 * @param countryCode - country code
 */
function getShippingCostByCountry(countryCode: string): ShippingCosts {
    switch (countryCode) {
        case 'BR':
            return {
                'shipping-001': '8.00',
                'shipping-002': '25.00'
            };
        default: {
            return {
                'shipping-001': '0.00',
                'shipping-002': '5.00',
                'shipping-003': '15.00'
            };
        }
    }
}

/**
 * Method that fetches the shipping options according to the country.
 * This function in most of the cases is asynchronous, as it will request shipping options in the backend
 *
 * @param countryCode - country code
 */
function getShippingOptions(countryCode?: string): Promise<google.payments.api.ShippingOptionParameters> {
    switch (countryCode) {
        case 'BR': {
            return Promise.resolve({
                defaultSelectedOptionId: 'shipping-001',
                shippingOptions: [
                    {
                        id: 'shipping-001',
                        label: 'R$ 8.00: Standard shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: 'R$ 25.00: Super Express shipping',
                        description: 'Standard shipping delivered in 2 business days.'
                    }
                ]
            });
        }
        default: {
            return Promise.resolve({
                defaultSelectedOptionId: 'shipping-001',
                shippingOptions: [
                    {
                        id: 'shipping-001',
                        label: 'R$ 0.00: Free shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: 'R$ 5.00: Fedex shipping',
                        description: 'Standard shipping delivered in 5 business days.'
                    },
                    {
                        id: 'shipping-003',
                        label: 'R$ 15.00: DHL Express shipping',
                        description: 'Express shipping delivered in 2 business day.'
                    }
                ]
            });
        }
    }
}

function getTransactionInfo(): google.payments.api.TransactionInfo {
    return {
        displayItems: [
            {
                label: 'Subtotal',
                type: 'SUBTOTAL',
                price: '99.00'
            },
            {
                label: 'Tax',
                type: 'TAX',
                price: '1.00'
            }
        ],
        countryCode: 'BR',
        currencyCode: 'BRL',
        totalPriceStatus: 'FINAL',
        totalPrice: '100.00',
        totalPriceLabel: 'Total'
    };
}

function convertFloatAmountToAdyenAmount(totalPrice: string): number {
    if (totalPrice.includes('.')) {
        return Number(totalPrice.replace('.', ''));
    }
    return Number(`${totalPrice}00`);
}

function calculateNewTransactionInfo(countryCode: string, selectedShippingOptionId: string) {
    const newTransactionInfo = getTransactionInfo();
    const shippingCost = getShippingCostByCountry(countryCode)[selectedShippingOptionId] ?? '0.00';

    newTransactionInfo.displayItems?.push({
        type: 'LINE_ITEM',
        label: 'Shipping cost',
        price: shippingCost,
        status: 'FINAL'
    });

    let totalPrice = 0.0;
    newTransactionInfo.displayItems?.forEach(displayItem => (totalPrice += parseFloat(displayItem.price)));
    newTransactionInfo.totalPrice = totalPrice.toString();

    finalAmount = convertFloatAmountToAdyenAmount(totalPrice.toString());

    return newTransactionInfo;
}

export const ExpressOnSessions: GooglePayStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <GooglePayExpressSessionsDemo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'shopperLocale', 'amount', 'showPayButton', 'countryCode', 'srConfig.showPanel'] }
    },
    args: {
        countryCode: COUNTRY_CODE,
        amount: INITIAL_AMOUNT,
        shopperLocale: SHOPPER_LOCALE
    }
};

export default meta;

function InfoBox() {
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

function GooglePayExpressSessionsDemo({
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
                        currency: getCurrency(COUNTRY_CODE),
                        value: finalAmount
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
                    // eslint-disable-next-line no-async-promise-executor
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

                                paymentDataRequestUpdate.newTransactionInfo = calculateNewTransactionInfo(
                                    shippingAddress.countryCode,
                                    selectedShippingOptionId
                                );
                            }
                        }
                        /** If SHIPPING_OPTION changed, we calculate the new fee */
                        if (callbackTrigger === 'SHIPPING_OPTION') {
                            if (shippingAddress?.countryCode && shippingOptionData?.id) {
                                paymentDataRequestUpdate.newTransactionInfo = calculateNewTransactionInfo(
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
