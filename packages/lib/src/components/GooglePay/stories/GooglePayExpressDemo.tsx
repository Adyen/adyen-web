import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import getCurrency from '../../../../storybook/utils/get-currency';
import { makePayment } from '../../../../storybook/helpers/checkout-api-calls';
import GooglePay from '../GooglePay';
import { createGooglePayAmountHelper, getShippingOptions, getTransactionInfo, EXPRESS_DEMO_SETTINGS } from './googlePayExpressUtils';

import type { ICore } from '../../../types';

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
            <strong>Google Pay Express on Advanced Flow</strong>
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

export function GooglePayExpressDemo({
    checkout
}: Readonly<{
    checkout: ICore;
}>) {
    const [googlePay, setGooglePay] = useState<GooglePay>();

    const createGooglePay = () => {
        const googlePay = new GooglePay(checkout, {
            isExpress: true,

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit: async (state, _component, actions) => {
                try {
                    const paymentData = {
                        amount: {
                            currency: getCurrency(EXPRESS_DEMO_SETTINGS.COUNTRY_CODE),
                            value: GooglePayAmountHelper.getFinalAmount()
                        },
                        countryCode: EXPRESS_DEMO_SETTINGS.COUNTRY_CODE,
                        shopperLocale: EXPRESS_DEMO_SETTINGS.SHOPPER_LOCALE
                    };

                    const { action, order, resultCode, donationToken } = await makePayment(state.data, paymentData);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                } catch (error) {
                    console.error('## onSubmit - critical error', error);
                    actions.reject();
                }
            },

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
        if (!googlePay) {
            createGooglePay();
        }
    }, [googlePay, createGooglePay]);

    if (!googlePay) {
        return <div>Loading...</div>;
    }

    return (
        <Fragment>
            <InfoBox />
            <ComponentContainer element={googlePay} />
        </Fragment>
    );
}
