/**
 * Calculate the time difference in minutes, between the future time and the current time (plus delay).
 * @param futureTime - string in utc datetime format
 * @param delayFromNow - milliseconds delay from now
 */
export function getTimeDiffInMinutesFromNow(futureTime: string, delayFromNow = 0) {
    const future = new Date(futureTime);
    const localDate = new Date();
    localDate.setTime(localDate.getTime() + delayFromNow);
    const diff = (future.getTime() - localDate.getTime()) / 60000;
    if (Number.isNaN(diff) || diff < 0) {
        throw new Error('Invalid countdown duration. A default one will be used.');
    }
    return diff;
}
