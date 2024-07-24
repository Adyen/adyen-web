import AdyenCheckout from './core';
import { render, screen, within } from '@testing-library/preact';
import { Ach, Card, Dropin } from '../components';

// TODO copy
const paymentMethodsResponse = {
    paymentMethods: [
        {
            name: 'ACH Direct Debit',
            type: 'ach'
        },
        {
            brands: ['visa', 'mc', 'amex', 'maestro', 'bcmc', 'cartebancaire'],
            name: 'Credit Card',
            type: 'scheme'
        }
    ],
    storedPaymentMethods: [
        {
            bankAccountNumber: '55555553123',
            bankLocationId: '121000358',
            id: 'RZTQFFMNG6KXWD82',
            //storedPaymentMethodId: 'RZTQFFMNG6KXWD82',
            name: 'ACH Direct Debit',
            ownerName: 'Jay jay',
            supportedRecurringProcessingModels: ['Subscription', 'UnscheduledCardOnFile', 'CardOnFile'],
            supportedShopperInteractions: ['ContAuth', 'Ecommerce'],
            type: 'ach'
        },
        {
            brand: 'visa',
            expiryMonth: '03',
            expiryYear: '2030',
            holderName: 'Checkout Shopper PlaceHolder',
            id: '8415',
            lastFour: '1111',
            name: 'VISA',
            networkTxReference: '0591',
            supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
            type: 'scheme',
            storedPaymentMethodId: '8415'
        }
    ]
};

const checkoutConfig = {
    amount: {
        currency: 'USD',
        value: 19000
    },
    shopperLocale: 'en-US',
    environment: 'test',
    clientKey: 'test_F7_FEKJHF',
    paymentMethodsResponse,
    countryCode: 'en-US'
};

const createDropinComponent = async mergeConfig => {
    const checkout = new AdyenCheckout({ ...checkoutConfig, ...mergeConfig });
    await checkout.initialize();
    const component = new Dropin(checkout, {
        paymentMethodComponents: [Ach, Card]
    });
    return component;
};

test('should render payButton', async () => {
    const dropinElement = await createDropinComponent({ showPayButton: true });
    render(dropinElement.render());

    // get all possible payment method selector buttons
    const paymentMethodListItemArray = await screen.findAllByRole('radio');

    // go trough and select each element in the dropin, check if it has payButton
    for (const paymentMethodListItem of paymentMethodListItemArray) {
        paymentMethodListItem.click();
        // eslint-disable-next-line testing-library/no-node-access
        expect(await within(paymentMethodListItem.parentElement.parentElement).findAllByRole('button')).toHaveLength(1);
    }
});

test('should NOT render payButton', async () => {
    const dropinElement = await createDropinComponent({ showPayButton: false });
    render(dropinElement.render());

    // get all possible payment method selector buttons
    const paymentMethodListItemArray = await screen.findAllByRole('radio');

    // go trough and select each element in the dropin, check if it has payButton
    for (const paymentMethodListItem of paymentMethodListItemArray) {
        paymentMethodListItem.click();
        // eslint-disable-next-line testing-library/no-node-access
        const element = within(paymentMethodListItem.parentElement.parentElement).queryByRole('button');
        // @ts-ignore toBeInDocument
        expect(element).not.toBeInTheDocument();
    }
});
