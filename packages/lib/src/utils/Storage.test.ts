import Storage from './Storage';

describe('Storage implementation - normal, window-based, storage', () => {
    test('Should add, retrieve and remove item from storage', () => {
        const storage = new Storage('checkout-attempt-id', 'localStorage');

        storage.set({ id: 'mockId' });

        let idObj: any = storage.get();

        expect(idObj.id).toEqual('mockId');

        storage.remove();
        idObj = storage.get();

        expect(idObj).toBe(null);
    });
});

describe('Storage implementation - storage fallback', () => {
    let windowSpy;

    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get');
    });

    test('Should add, retrieve and remove item from storage', () => {
        windowSpy.mockImplementation(() => ({
            localStorage: null
        }));

        const storage = new Storage('checkout-attempt-id', 'localStorage');

        storage.set({ id: 'mockId' });

        expect(storage.storage.key('adyen-checkout__checkout-attempt-id')).toEqual(0);
        expect(storage.storage.length).toEqual(1);

        let idObj: any = storage.get();

        expect(idObj.id).toEqual('mockId');

        storage.remove();

        idObj = storage.get();

        expect(idObj).toBe(null);

        storage.set({ id: 'mockId2' });
        idObj = storage.get();

        expect(idObj.id).toEqual('mockId2');

        storage.storage.clear();

        idObj = storage.get();

        expect(idObj).toBe(null);
    });
});
