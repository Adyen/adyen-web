import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { GooglePayConfiguration } from '../types';
import getCurrency from '../../../../storybook/utils/get-currency';
import GooglePay from '../GooglePay';
import { makePayment } from '../../../../storybook/helpers/checkout-api-calls';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ICore } from '../../../types';

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

export const ExpressOnAdvanced: GooglePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <GooglePayExpressDemo checkout={checkout} />}</Checkout>
    ),
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

function GooglePayExpressDemo({
    checkout
}: Readonly<{
    checkout: ICore;
}>) {
    const [googlePay, setGooglePay] = useState<GooglePay>();

    const createGooglePay = () => {
        const googlePay = new GooglePay(checkout, {
            isExpress: true,

            onSubmit: async (state, _component, actions) => {
                try {
                    const paymentData = {
                        amount: {
                            currency: getCurrency(COUNTRY_CODE),
                            value: finalAmount
                        },
                        countryCode: COUNTRY_CODE,
                        shopperLocale: SHOPPER_LOCALE
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
