import { render, screen } from '@testing-library/preact';
import { AdyenCheckout } from '../../core/AdyenCheckout';

import Dropin from '../Dropin';
import Blik from './Blik';

import getTranslations from '../../core/Services/get-translations';
jest.mock('../../core/Services/get-translations');

const mockedGetTranslations = getTranslations as jest.Mock;
mockedGetTranslations.mockResolvedValue({});

describe('Blik', () => {
    const createDropin = async paymentMethodsResponse => {
        const checkout = await AdyenCheckout({
            countryCode: 'US',
            environment: 'test',
            clientKey: 'test_123456',
            analytics: { enabled: false },
            paymentMethodsResponse: paymentMethodsResponse
        });
        return new Dropin(checkout, { paymentMethodComponents: [Blik] });
    };

    describe('in Dropin display correct payment method name', () => {
        test('display only blik if it is not stored', async () => {
            const dropin = await createDropin({ paymentMethods: [{ type: 'blik', name: 'Blik' }] });
            render(dropin.render());

            const blikText = await screen.findByText('Blik');

            expect(blikText).toBeInTheDocument();
        });

        test('display blik payment method name and label', async () => {
            const dropin = await createDropin({
                storedPaymentMethods: [
                    {
                        id: 'X8CN3VMB6XXZTX43',
                        label: 'mBank PMM',
                        name: 'Blik',
                        supportedRecurringProcessingModels: ['CardOnFile'],
                        supportedShopperInteractions: ['Ecommerce'],
                        type: 'blik'
                    }
                ]
            });
            render(dropin.render());

            const blikText = await screen.findByText('Blik');
            const storedPaymentMethodLabel = await screen.findByText('mBank PMM');

            expect(blikText).toBeInTheDocument();
            expect(storedPaymentMethodLabel).toBeInTheDocument();
        });
    });
});
