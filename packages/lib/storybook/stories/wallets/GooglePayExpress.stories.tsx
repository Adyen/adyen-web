import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { GooglePayConfiguration } from '../../../src/components/GooglePay/types';
import { handleSubmit } from '../../helpers/checkout-handlers';
import getCurrency from '../../utils/get-currency';
import { GooglePay } from '../../../src';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const COUNTRY_CODE = 'US';
const SHOPPER_LOCALE = 'en-US';
const INITIAL_AMOUNT = 10000;

let finalAmount = INITIAL_AMOUNT;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Wallets/GooglePay'
};

/**
 * Method that calculate the shipping costs based on the country/shipping options
 *
 * @param countryCode - country code
 */
function getShippingCost(countryCode) {
    switch (countryCode) {
        case 'BR':
            return {
                'shipping-001': '5.00',
                'shipping-002': '19.99'
            };
        default: {
            return {
                'shipping-001': '0.00',
                'shipping-002': '1.99',
                'shipping-003': '9.99'
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
function getShippingOptions(countryCode?: string) {
    switch (countryCode) {
        case 'BR': {
            return Promise.resolve({
                defaultSelectedOptionId: 'shipping-001',
                shippingOptions: [
                    {
                        id: 'shipping-001',
                        label: '$5.00: Standard shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: '$19.99: Standard shipping',
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
                        label: '$0.00: Free shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: '$1.99: Standard shipping',
                        description: 'Standard shipping delivered in 3 business days.'
                    },
                    {
                        id: 'shipping-003',
                        label: '$9.99: Express shipping',
                        description: 'Express shipping delivered in 1 business day.'
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
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: '12.00',
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
    const shippingCost = getShippingCost(countryCode)[selectedShippingOptionId];

    newTransactionInfo.displayItems.push({
        type: 'LINE_ITEM',
        label: 'Shipping cost',
        price: shippingCost,
        status: 'FINAL'
    });

    let totalPrice = 0.0;
    newTransactionInfo.displayItems.forEach(displayItem => (totalPrice += parseFloat(displayItem.price)));
    newTransactionInfo.totalPrice = totalPrice.toString();

    finalAmount = convertFloatAmountToAdyenAmount(totalPrice.toString());

    return newTransactionInfo;
}

const createComponent = (args: PaymentMethodStoryProps<GooglePayConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const googlepay = new GooglePay(checkout, componentConfiguration);
    return <Container element={googlepay} />;
};

export const Express: GooglePayStory = {
    render: createComponent,
    argTypes: {
        useSessions: {
            control: false
        },
        countryCode: {
            control: false
        },
        amount: {
            control: false
        },
        shopperLocale: {
            control: false
        },
        showPayButton: {
            control: false
        }
    },
    args: {
        useSessions: false,
        countryCode: COUNTRY_CODE,
        amount: INITIAL_AMOUNT,
        shopperLocale: SHOPPER_LOCALE,
        componentConfiguration: {
            onSubmit: (state, component) => {
                const paymentData = {
                    amount: {
                        currency: getCurrency(COUNTRY_CODE),
                        value: finalAmount
                    },
                    countryCode: COUNTRY_CODE,
                    shopperLocale: SHOPPER_LOCALE
                };
                handleSubmit(state, component, null, paymentData);
            },
            onAuthorized: paymentData => {
                console.log('Shopper details', paymentData);
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
                        if (shippingAddress.countryCode !== 'US' && shippingAddress.countryCode !== 'BR') {
                            paymentDataRequestUpdate.error = {
                                reason: 'SHIPPING_ADDRESS_UNSERVICEABLE',
                                message: 'Cannot ship to the selected address',
                                intent: 'SHIPPING_ADDRESS'
                            };
                        }
                        /** If it initializes or changes the shipping address, we calculate the shipping options and transaction info  */
                        if (callbackTrigger === 'INITIALIZE' || callbackTrigger === 'SHIPPING_ADDRESS') {
                            paymentDataRequestUpdate.newShippingOptionParameters = await getShippingOptions(shippingAddress.countryCode);
                            const selectedShippingOptionId = paymentDataRequestUpdate.newShippingOptionParameters.defaultSelectedOptionId;
                            paymentDataRequestUpdate.newTransactionInfo = calculateNewTransactionInfo(
                                shippingAddress.countryCode,
                                selectedShippingOptionId
                            );
                        }
                        /** If SHIPPING_OPTION changed, we calculate the new fee */
                        if (callbackTrigger === 'SHIPPING_OPTION') {
                            paymentDataRequestUpdate.newTransactionInfo = calculateNewTransactionInfo(
                                shippingAddress.countryCode,
                                shippingOptionData.id
                            );
                        }

                        resolve(paymentDataRequestUpdate);
                    });
                }
            },
            // Shipping Address config
            shippingAddressRequired: true,

            shippingAddressParameters: {
                allowedCountryCodes: [],
                phoneNumberRequired: true
            },

            // Shipping Options config
            shippingOptionRequired: true
        }
    }
};

export default meta;
