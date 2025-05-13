import Riverty from './Riverty';

describe('Riverty', () => {
    test('should return subtype "redirect" in the payment data', () => {
        const riverty = new Riverty(global.core);
        const data = riverty.formatData();

        expect(data).toEqual(
            expect.objectContaining({
                paymentMethod: { type: 'riverty', subtype: 'redirect' }
            })
        );
    });
});
