export class EventsQueue<P> {
    private queue: Array<P>;
    // When reaching the max length, we send all events
    private maxLength: number;
    // Debounce time to send events
    private debounceTime: number;

    constructor({ maxLength, debounceTime }) {
        this.maxLength = maxLength;
        this.debounceTime = debounceTime;
    }

    public push(event: P) {
        // if reaches the max size, do not push. throw an error and catch it in the caller
        this.queue.push(event);
    }

    public clear() {
        this.queue = [];
    }

    public all() {
        return this.queue.map(event => event);
    }
}
