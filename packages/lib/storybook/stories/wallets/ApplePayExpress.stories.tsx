import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { ApplePayConfiguration } from '../../../src/components/ApplePay/types';
import getCurrency from '../../utils/get-currency';
import ApplePay from '../../../src/components/ApplePay';
import { makePayment } from '../../helpers/checkout-api-calls';
import { Checkout } from '../Checkout';

type ApplePayStory = StoryConfiguration<ApplePayConfiguration>;

const COUNTRY_CODE = 'US';
const SHOPPER_LOCALE = 'en-US';
const INITIAL_AMOUNT = 10000;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Wallets/ApplePay'
};

/**
 * Method that fetches the shipping options according to the country.
 * This function in most of the cases is asynchronous, as it will request shipping options in the backend
 *
 * @param countryCode - country code
 */
const getShippingMethods = (countryCode: string): Promise<ApplePayJS.ApplePayShippingMethod[]> => {
    switch (countryCode) {
        case 'US': {
            return Promise.resolve([
                {
                    label: 'Standard Shipping',
                    detail: 'Arrives in 5 to 7 days',
                    amount: '5.99',
                    identifier: 'Standard'
                },
                {
                    label: 'Express',
                    detail: 'Arrives in 2 to 3 days',
                    amount: '10.99',
                    identifier: 'Express'
                }
            ]);
        }
        case 'NL':
        default: {
            return Promise.resolve([
                {
                    label: 'Free Shipping',
                    detail: 'Arrives in 10 to 15 days',
                    amount: '0.00',
                    identifier: 'FreeShip'
                },
                {
                    label: 'Standard',
                    detail: 'Arrives in 5 to 10 days',
                    amount: '9.99',
                    identifier: 'Standard'
                },
                {
                    label: 'Express',
                    detail: 'Arrives in 2 to 3 days',
                    amount: '15.99',
                    identifier: 'Express'
                }
            ]);
        }
    }
};

const createLineItems = (shippingMethod: ApplePayJS.ApplePayShippingMethod): ApplePayJS.ApplePayLineItem[] => {
    const lineItems = [
        {
            label: 'Sun Glasses',
            amount: '35.00',
            type: 'final' as const
        },
        {
            label: 'Estimated Tax',
            amount: '5.00',
            type: 'final' as const
        }
    ];
    lineItems.push({
        label: `Delivery: ${shippingMethod.label}`,
        amount: shippingMethod.amount,
        type: 'final' as const
    });
    return lineItems;
};

const createApplePayTotal = (lineItems: ApplePayJS.ApplePayLineItem[]): ApplePayJS.ApplePayLineItem => {
    let totalPrice = 0.0;
    lineItems.forEach((item: any) => (totalPrice += parseFloat(item.amount)));
    return {
        label: 'MYSTORE, INC.',
        amount: totalPrice.toString()
    };
};

const createApplePayAmountHelper = () => {
    let applePayTotal: ApplePayJS.ApplePayLineItem = null;

    function convertFloatAmountToAdyenAmount(totalPrice: string): number {
        if (totalPrice.includes('.')) {
            return Number(totalPrice.replace('.', ''));
        }
        return Number(`${totalPrice}00`);
    }

    return {
        getFinalAdyenAmount() {
            return convertFloatAmountToAdyenAmount(applePayTotal.amount);
        },
        getApplePayTotal() {
            return applePayTotal;
        },
        setApplePayTotal(newTotal: ApplePayJS.ApplePayLineItem) {
            applePayTotal = newTotal;
        }
    };
};
const ApplePayAmountHelper = createApplePayAmountHelper();

export const Express: ApplePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new ApplePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
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
            isExpress: true,

            renderApplePayCodeAs: 'modal',

            onSubmit: async (state, component, actions) => {
                try {
                    const paymentData = {
                        amount: {
                            currency: getCurrency(COUNTRY_CODE),
                            value: ApplePayAmountHelper.getFinalAdyenAmount()
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
                console.log('Authorized event', data);
                actions.resolve();
            },

            onShippingContactSelected: async (resolve, reject, event) => {
                const { countryCode } = event.shippingContact;
                let update: Partial<ApplePayJS.ApplePayShippingContactUpdate> = {};

                if (countryCode === 'BR') {
                    update = {
                        newTotal: ApplePayAmountHelper.getApplePayTotal(),
                        errors: [new ApplePayError('shippingContactInvalid', 'countryCode', 'Cannot ship to the selected address')]
                    };
                    resolve(update);
                    return;
                }

                const newShippingMethods = await getShippingMethods(countryCode);
                const newLineItems = createLineItems(newShippingMethods[0]);
                const newTotal = createApplePayTotal(newLineItems);

                ApplePayAmountHelper.setApplePayTotal(newTotal);

                update = {
                    newTotal,
                    newLineItems,
                    newShippingMethods
                };

                resolve(update);
            },

            onShippingMethodSelected: (resolve, reject, event) => {
                const { shippingMethod } = event;
                const newLineItems = createLineItems(shippingMethod);
                const newTotal = createApplePayTotal(newLineItems);

                const update: ApplePayJS.ApplePayShippingContactUpdate = {
                    newTotal,
                    newLineItems
                };

                ApplePayAmountHelper.setApplePayTotal(newTotal);

                resolve(update);
            },

            requiredBillingContactFields: ['postalAddress'],

            requiredShippingContactFields: ['postalAddress', 'name', 'phoneticName', 'phone', 'email']
        }
    }
};

export default meta;
