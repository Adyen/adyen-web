import { render, screen } from '@testing-library/preact';
import { AdyenCheckout } from '../../core/AdyenCheckout';
import Dropin from '../Dropin';

describe('Blik', () => {
    const createDropin = async paymentMethodsResponse => {
        const checkout = await AdyenCheckout({
            countryCode: 'US',
            environment: 'test',
            clientKey: 'test_123456',
            analytics: { enabled: false },
            paymentMethodsResponse: paymentMethodsResponse
        });
        return new Dropin(checkout);
    };

    describe('in Dropin display correct payment method name', () => {
        test('display only blik if it is not stored', async () => {
            const blik = await createDropin({ paymentMethods: [{ type: 'blik', name: 'Blik' }] });
            render(blik.render());

            const blikText = await screen.findByText('Blik');

            expect(blikText).toBeInTheDocument();
        });

        test('display blik payment method name and label', async () => {
            const blik = await createDropin({
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
            render(blik.render());

            const blikText = await screen.findByText('Blik');
            const storedPaymentMethodLabel = await screen.findByText('mBank PMM');

            expect(blikText).toBeInTheDocument();
            expect(storedPaymentMethodLabel).toBeInTheDocument();
        });
    });
});
