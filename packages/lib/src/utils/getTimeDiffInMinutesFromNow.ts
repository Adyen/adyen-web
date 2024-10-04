/**
 * Calculate the time difference in minutes, between the future UTC time and the current time (plus delay).
 * @param futureTime - UTC date time string in the ISO 8601 format
 * @param delayFromNow - milliseconds delay from now
 */
export function getTimeDiffInMinutesFromNow(futureTime: string, delayFromNow = 0) {
    const future = new Date(futureTime);
    const now = new Date();
    now.setTime(now.getTime() + delayFromNow);
    const diff = (future.getTime() - now.getTime()) / 60000;
    if (Number.isNaN(diff) || diff < 0) {
        throw new Error('Invalid countdown duration. A default one will be used.');
    }
    return diff;
}
