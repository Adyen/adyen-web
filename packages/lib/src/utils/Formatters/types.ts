// Context holds state data for the input field implementing this.
export type FormatterFn = (value: string, context?: {
    state: {
        data: {
            country?: string,
        },
    },
}) => string;
