/**
 * Pads a given string or number with zeros.
 *
 * @param value - Value to zero-pad.
 * @param length - Amount of characters to pad.
 * @returns Left-padded number/string.
 */
export const zeroPad = (value, length = 2) => {
    if (length === 0) return value;
    const strValue = String(value);
    return strValue.length >= length ? strValue : ('0'.repeat(length) + strValue).slice(length * -1);
};

/**
 * Calculates the remaining time as a percentage
 *
 * @param start - Start date
 * @param now - Current date
 * @param end - End date
 * @returns Percentage of the remaining time
 */
export const getProgressPercentage = (start, now, end) => {
    const difference = end.getTime() - start.getTime();
    return 100 - Math.round(((now.getTime() - start.getTime()) * 100) / difference);
};

/**
 * Calculates the difference in minutes and seconds from now to endDate
 *
 * @param startTime -
 * @param endTime -
 * @returns  Time difference
 */
export const getTimeDifference = (startTime, endTime) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const seconds = diff / 1000;
    const percentage = getProgressPercentage(startTime, now, endTime);

    return {
        total: diff,
        minutes: zeroPad(Math.floor((seconds / 60) % 60)),
        seconds: zeroPad(Math.floor(seconds % 60)),
        completed: diff <= 0,
        percentage
    };
};
