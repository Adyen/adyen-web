import { executeWithTimeout } from './execute-with-timeout';
import TimeoutError from '../errors/TimeoutError';

const error = new TimeoutError({
    source: 'init',
    isTimeoutTriggeredBySchemeSdk: true,
    scheme: 'mc'
});

describe('executeWithTimeout', () => {
    it('should return the result of asyncFn if it resolves before timeout', async () => {
        const asyncFn = jest.fn().mockResolvedValue('success');
        const timer = 1000; // 1 second timeout

        const result = await executeWithTimeout(asyncFn, timer, error);

        expect(result).toBe('success');
        expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('should throw TimeoutError if asyncFn does not resolve before timeout', async () => {
        const asyncFn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 2000))); // Resolves in 2 seconds
        const timer = 1000; // 1 second timeout

        await expect(executeWithTimeout(asyncFn, timer, error)).rejects.toThrow(TimeoutError);
        expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('should throw the original error if asyncFn rejects', async () => {
        const asyncFn = jest.fn(() => Promise.reject(new Error('async error')));
        const timer = 1000; // 1 second timeout

        await expect(executeWithTimeout(asyncFn, timer, error)).rejects.toThrow('async error');
        expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('should clear the timeout if asyncFn resolves before timeout', async () => {
        jest.useFakeTimers();
        const asyncFn = jest.fn().mockResolvedValue('success');
        const timer = 1000; // 1 second timeout

        const promise = executeWithTimeout(asyncFn, timer, error);

        jest.runAllTimers(); // Fast-forward all timers

        const result = await promise;
        expect(result).toBe('success');
        expect(asyncFn).toHaveBeenCalledTimes(1);
    });
});
