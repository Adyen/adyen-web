import promiseTimeout from './promiseTimeout';

const promiseOne = (callBackFn): Promise<object> =>
    new Promise(() => {
        window.setTimeout(() => {
            if (callBackFn !== undefined) {
                callBackFn();
            }
        }, 100);

        return {};
    });

describe('creating a promiseTimeout', () => {
    test('and resolving it', () => {
        const newPromiseTimeout = promiseTimeout(1000, Promise.resolve({ resolved: true }), { timed_out: true });
        return newPromiseTimeout.promise.then(data => expect(data).toEqual({ resolved: true }));
    });

    test('and rejecting it', () => {
        const newPromiseTimeout = promiseTimeout(1000, Promise.reject('rejected'), { timed_out: true });
        expect(newPromiseTimeout.promise).rejects.toEqual('rejected');
    });

    test('and letting it time out', async () => {
        jest.useFakeTimers();
        const newPromiseTimeout = promiseTimeout(
            1000,
            promiseOne(() => {}),
            { timed_out: true }
        );

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(1000);
        expect(newPromiseTimeout.promise).rejects.toEqual({ timed_out: true });
    });
});

describe('canceling a promiseTimeout', () => {
    test('creating a promise timeOut with callBack and then canceling it', () => {
        const timeoutSpy = jest.spyOn(window, 'setTimeout');
        const timeOutClearSpy = jest.spyOn(window, 'clearTimeout');
        const callBackFunction = jest.fn();
        const newPromiseTimeout = promiseTimeout(2000, promiseOne(callBackFunction), { timed_out: true });

        newPromiseTimeout.promise;

        expect(timeoutSpy).toHaveBeenCalled();

        newPromiseTimeout.cancel();

        expect(timeOutClearSpy).toHaveBeenCalled();

        timeoutSpy.mockRestore();
        timeOutClearSpy.mockRestore();
    });
});
