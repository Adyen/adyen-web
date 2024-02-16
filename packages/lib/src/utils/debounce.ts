export const DEFAULT_DEBOUNCE_TIME_MS = 300;

export const debounce = (fn: Function, ms = DEFAULT_DEBOUNCE_TIME_MS) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
};
