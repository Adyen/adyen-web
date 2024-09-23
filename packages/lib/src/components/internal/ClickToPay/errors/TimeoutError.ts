interface TimeoutErrorProps {
    source: string;
    scheme: string;
    isTimeoutTriggeredBySchemeSdk: boolean;
}

class TimeoutError extends Error {
    public scheme: string;
    public source: string;
    public isTimeoutTriggeredBySchemeSdk: boolean;

    /** Currently populated only by Visa SDK if available */
    public correlationId?: string;

    constructor(options: TimeoutErrorProps) {
        super(`ClickToPayService - Timeout during ${options.source}() of the scheme '${options.scheme}'`);

        this.name = 'TimeoutError';
        this.source = options.source;
        this.scheme = options.scheme;
        this.isTimeoutTriggeredBySchemeSdk = options.isTimeoutTriggeredBySchemeSdk;
    }

    public setCorrelationId(correlationId: string): void {
        this.correlationId = correlationId;
    }
}

export default TimeoutError;
