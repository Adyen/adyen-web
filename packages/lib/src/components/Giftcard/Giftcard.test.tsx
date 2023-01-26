import Giftcard from './Giftcard';
const flushPromises = () => new Promise(process.nextTick);

describe('Giftcard', () => {
    const baseProps = { amount: { value: 1000, currency: 'EUR' }, name: 'My Test Gift Card', type: 'giftcard', brand: 'genericgiftcard' };

    describe('onBalanceCheck', () => {
        test('If onBalanceCheck is not provided, step is skipped and calls onSubmit', async () => {
            const onSubmitMock = jest.fn();
            const giftcard = new Giftcard({ ...baseProps, onSubmit: onSubmitMock });
            giftcard.setState({ isValid: true });
            giftcard.onBalanceCheck();
            await flushPromises();

            expect(onSubmitMock).toHaveBeenCalled();
        });

        test('onBalanceCheck will be skipped if the component is not valid', () => {
            const onBalanceCheck = jest.fn();
            const giftcard = new Giftcard({ ...baseProps, onBalanceCheck });
            giftcard.setState({ isValid: false });
            giftcard.onBalanceCheck();

            expect(onBalanceCheck).not.toHaveBeenCalled();
        });
    });
});
