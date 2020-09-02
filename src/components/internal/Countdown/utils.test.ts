import { zeroPad, getTimeDifference, getProgressPercentage } from './utils';

describe('Countdown utils', () => {
    describe('zeroPad', () => {
        test('adds zeros to the required length', () => {
            expect(zeroPad(1)).toBe('01');
            expect(zeroPad(1, 10)).toBe('0000000001');
        });

        test('does not pad if not necessary', () => {
            expect(zeroPad(10)).toBe('10');
            expect(zeroPad(1, 1)).toBe('1');
        });
    });

    describe('getTimeDifference', () => {
        const getEndDate = minutes => new Date(new Date().getTime() + minutes * 60000);
        const getStartDate = () => new Date();

        test('Calculates difference with an endDate in the future', () => {
            const endDate = getEndDate(15);
            const startDate = getStartDate();
            const timeDifference = getTimeDifference(startDate, endDate);
            expect(timeDifference.minutes).toBeDefined();
            expect(timeDifference.seconds).toBeDefined();
            expect(timeDifference.completed).toBe(false);
            expect(timeDifference.total).toBeDefined();
        });
    });

    describe('getProgressPercentage', () => {
        const fixedDate = new Date('2018-02-28T09:39:59');

        beforeAll(() => {
            Date.now = () => fixedDate.getTime();
        });

        afterAll(() => {
            jest.restoreAllMocks();
        });

        test('should get 100% if now equals start', () => {
            const now = Date.now();
            const startTime = new Date(now - 1 * 60000); // 1 min ago
            const endTime = new Date(now + 1 * 60000); // in 1 min

            expect(getProgressPercentage(startTime, startTime, endTime)).toBe(100);
        });

        test('should get 75%', () => {
            const now = Date.now();
            const startTime = new Date(now - 1 * 60000); // 1 min ago
            const endTime = new Date(now + 1 * 60000); // in 1 min
            const newNow = new Date(now - (1 * 60000) / 2); //

            expect(getProgressPercentage(startTime, newNow, endTime)).toBe(75);
        });

        test('should get 50% if now is in the middle', () => {
            const now = Date.now();
            const startTime = new Date(now - 1 * 60000); // 1 min ago
            const endTime = new Date(now + 1 * 60000); // in 1 min

            expect(getProgressPercentage(startTime, new Date(now), endTime)).toBe(50);
        });

        test('should get 25%', () => {
            const now = Date.now();
            const startTime = new Date(now - 1 * 60000); // 1 min ago
            const endTime = new Date(now + 1 * 60000); // in 1 min
            const newNow = new Date(now + (1 * 60000) / 2); //

            expect(getProgressPercentage(startTime, newNow, endTime)).toBe(25);
        });

        test('should get 0% if now equals end', () => {
            const now = Date.now();
            const startTime = new Date(now - 1 * 60000); // 1 min ago
            const endTime = new Date(now + 1 * 60000); // in 1 min

            expect(getProgressPercentage(startTime, endTime, endTime)).toBe(0);
        });
    });
});
