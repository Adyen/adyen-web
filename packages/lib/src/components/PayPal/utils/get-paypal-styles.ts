import { SUPPORTED_COLORS_FOR_CREDIT } from '../config';
import type { FundingSource } from '../types';

/**
 * Processes and returns a new style object.
 */
export const getStyle = (fundingSource: FundingSource, style = {}) => {
    if (fundingSource === 'paypal') return { ...style };

    return Object.keys(style).reduce((acc, prop) => {
        const value = style[prop];
        if (prop !== 'color' || SUPPORTED_COLORS_FOR_CREDIT.includes(value)) {
            acc[prop] = value;
        }
        return acc;
    }, {});
};
