class NonPersistentStorage {
    private storage: Record<string, string>;

    constructor() {
        this.storage = {};
    }

    public get length(): number {
        return Object.keys(this.storage).length;
    }

    public key(index: number): string | null {
        return Object.keys(this.storage)[index] ?? null;
    }

    public getItem(keyName: string): string | null {
        return this.storage[keyName] || null;
    }

    public setItem(keyName: string, keyValue: string): void {
        this.storage[keyName] = keyValue;
    }

    public removeItem(keyName: string): void {
        delete this.storage[keyName];
    }

    public clear(): void {
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

    public get(): T | null {
        try {
            const item = this.storage.getItem(this.key);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            return null;
        }
    }

    public set(value: T): void {
        this.storage.setItem(this.key, JSON.stringify(value));
    }

    public remove(): void {
        this.storage.removeItem(this.key);
    }

    public clear(): void {
        this.storage.clear();
    }

    public keyByIndex(index: number): string | null {
        return this.storage.key(index);
    }

    public get length(): number {
        return this.storage.length;
    }
}

export default Storage;
