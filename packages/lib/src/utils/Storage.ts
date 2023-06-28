class NonPersistentStorage {
    private storage;

    constructor() {
        this.storage = {};
    }

    get length() {
        return Object.keys(this.storage).length;
    }

    key(index) {
        return Object.keys(this.storage)[index];
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
            if (!this.storage) {
                throw new Error('storage does not exist');
            }
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

    public clear() {
        this.storage.clear();
    }

    public keyByIndex(index) {
        return this.storage.key(index);
    }

    get length() {
        return this.storage.length;
    }
}

export default Storage;
