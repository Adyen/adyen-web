class SrciError extends Error {
    public reason: string;

    constructor(message, reason) {
        super(message);
        this.reason = reason;
    }
}

export default SrciError;
