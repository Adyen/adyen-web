import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ApplePayConfiguration } from '../../../src/components/ApplePay/types';
import { handleSubmit } from '../../helpers/checkout-handlers';
import getCurrency from '../../utils/get-currency';
import { ApplePay } from '../../../src';

type ApplePayStory = StoryConfiguration<ApplePayConfiguration>;

const COUNTRY_CODE = 'US';
const SHOPPER_LOCALE = 'en-US';
const INITIAL_AMOUNT = 10000;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Wallets/ApplePay'
};

const getShippingMethods = (countryCode: string): ApplePayJS.ApplePayShippingMethod[] => {
    switch (countryCode) {
        case 'US': {
            return [
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
            ];
        }
        case 'NL':
        default: {
            return [
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
            ];
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

const createComponent = (args: PaymentMethodStoryProps<ApplePayConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const applepay = new ApplePay({ core: checkout, ...componentConfiguration });
    return <Container element={applepay} />;
};

export const Express: ApplePayStory = {
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
            countryCode: COUNTRY_CODE,

            onSubmit: (state, component) => {
                const paymentData = {
                    amount: {
                        currency: getCurrency(COUNTRY_CODE),
                        value: ApplePayAmountHelper.getFinalAdyenAmount()
                    },
                    countryCode: COUNTRY_CODE,
                    shopperLocale: SHOPPER_LOCALE
                };
                handleSubmit(state, component, null, paymentData);
            },

            onAuthorized: paymentData => {
                console.log('Shopper details', paymentData);
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

                const newShippingMethods = getShippingMethods(countryCode);
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
