import { FormatterFn } from './types';

// Removes all non-digits
export const digitsOnlyFormatter: FormatterFn = (value: string) => {
    return value.replace(/[^0-9]/g, '');
};

export const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
