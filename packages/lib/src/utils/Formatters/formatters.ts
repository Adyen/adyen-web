import { FormatterFn } from "./types";

// Removes all non-digits
export const digitsOnlyFormatter: FormatterFn = (value:string) => {
    return value.replace(/[^0-9]/g, '');
}