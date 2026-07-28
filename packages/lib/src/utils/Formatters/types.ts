// Context holds state data for the input field implementing this.
export type FormatterFn = (value: string, context?: FormatterContext) => string;

export type FormatterContext = {
    state: {
        data: {
            country?: string;
        };
    };
};
