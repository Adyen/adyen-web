class Storage<T> {
    private readonly prefix = 'adyen-checkout__';
    private readonly key: string;
    private storage: globalThis.Storage;

    constructor(key: string, storage = window.localStorage) {
        this.storage = storage;
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
