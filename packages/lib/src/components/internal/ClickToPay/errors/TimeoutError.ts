class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }

    toString() {
        return `Message: ${this.message}`;
    }
}

export default TimeoutError;
