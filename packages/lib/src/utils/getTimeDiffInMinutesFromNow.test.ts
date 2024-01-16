import { getTimeDiffInMinutesFromNow } from './getTimeDiffInMinutesFromNow';

describe('getTimeDiffInMinutesFromNow', () => {
    test('should return the time difference in minutes without delay', () => {
        const fiveMinutes = 5;
        const futureTime = new Date(Date.now() + 1000 * 60 * fiveMinutes);
        expect(getTimeDiffInMinutesFromNow(futureTime.toISOString())).toEqual(fiveMinutes);
    });

    test('should return the time difference in minutes with a delay', () => {
        const fiveMinutes = 5;
        const delay = 1000 * 60 * fiveMinutes;
        const futureTime = new Date(Date.now() + delay);
        expect(getTimeDiffInMinutesFromNow(futureTime.toISOString(), delay)).toEqual(0);
    });

    test('should throw an error when the time duration cannot be calculated', () => {
        expect(() => getTimeDiffInMinutesFromNow('wrong datetime')).toThrow();
    });
});
