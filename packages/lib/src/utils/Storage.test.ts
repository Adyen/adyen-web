import Storage from './Storage';

describe('Storage implementation - normal, window-based, storage', () => {
    test('Should add, retrieve and remove item from storage', () => {
        const storage = new Storage('checkout-attempt-id', 'localStorage');

        storage.set({ id: 'mockId' });

        expect(storage.keyByIndex(0)).toEqual('adyen-checkout__checkout-attempt-id');
        expect(storage.length).toEqual(1);

        let idObj: any = storage.get();

        expect(idObj.id).toEqual('mockId');

        storage.remove();
        idObj = storage.get();

        expect(idObj).toBe(null);

        storage.set({ id: 'mockId2' });
        idObj = storage.get();

        expect(idObj.id).toEqual('mockId2');

        storage.clear();

        idObj = storage.get();

        expect(idObj).toBe(null);
    });
});

describe('Storage implementation - storage fallback', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Should add, retrieve and remove item from storage', () => {
        jest.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
            throw new Error('localStorage is not available');
        });

        const storage = new Storage('checkout-attempt-id', 'localStorage');

        storage.set({ id: 'mockId' });

        expect(storage.keyByIndex(0)).toEqual('adyen-checkout__checkout-attempt-id');
        expect(storage.length).toEqual(1);

        let idObj: any = storage.get();

        expect(idObj.id).toEqual('mockId');

        storage.remove();

        idObj = storage.get();

        expect(idObj).toBe(null);

        storage.set({ id: 'mockId2' });
        idObj = storage.get();

        expect(idObj.id).toEqual('mockId2');

        storage.clear();

        idObj = storage.get();

        expect(idObj).toBe(null);
    });
});
