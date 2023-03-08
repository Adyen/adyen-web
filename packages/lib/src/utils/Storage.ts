class NonPersistentStorage {
    private storage;

    constructor() {
        this.storage = {};
    }

    get length() {
        return Object.keys(this.storage).length;
    }

    key(keyName) {
        return Object.keys(this.storage).indexOf(keyName);
    }
    getItem(keyName) {
        return this.storage[keyName] || null;
    }
    setItem(keyName, keyValue) {
        return (this.storage[keyName] = keyValue);
    }
    removeItem(keyName) {
        delete this.storage[keyName];
    }
    clear() {
        this.storage = {};
    }
}

class Storage<T> {
    private readonly prefix = 'adyen-checkout__';
    private readonly key: string;
    private storage: globalThis.Storage | NonPersistentStorage;

    constructor(key: string, storageType: 'sessionStorage' | 'localStorage') {
        try {
            this.storage = storageType ? window[storageType] : window.localStorage;
        } catch (e) {
            this.storage = new NonPersistentStorage();
        }
        this.key = this.prefix + key;
    }

    public get(): T {
        try {
            return JSON.parse(this.storage.getItem(this.key));
        } catch (err) {
            return null;
        }
    }

    public set(value: T) {
        this.storage.setItem(this.key, JSON.stringify(value));
    }

    public remove() {
        this.storage.removeItem(this.key);
    }
}

export default Storage;
