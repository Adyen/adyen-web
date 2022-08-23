type MastercardError = {
    message: string;
    reason: string;
};

type VisaError = {
    error: {
        message: string;
        reason: string;
    };
};

class SrciError extends Error {
    public reason: string;
    public message: string;

    constructor(schemeError: VisaError | MastercardError) {
        super();

        const message = 'error' in schemeError ? schemeError?.error?.message : schemeError?.message;
        const reason = 'error' in schemeError ? schemeError?.error?.reason : schemeError?.reason;

        this.message = message;
        this.reason = reason;
    }
}

export default SrciError;
