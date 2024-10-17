class CancelError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export default CancelError;
