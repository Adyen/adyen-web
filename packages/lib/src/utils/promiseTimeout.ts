/**
 * Tests if a passed promise settles before a certain amount of time has elapsed
 *
 * @param ms - number of milliseconds the passed promise has to settle
 * @param promise - the passed promise
 * @param timeOutObject - the object that the promiseTimeout will reject with if the passed promise doesn't settle in time
 */
const promiseTimeout = (ms: number, promise: Promise<any>, timeOutObject: object) => {
    let timer;

    const promiseTimer: Promise<any> = new Promise((resolve, reject): void => {
        // Create a timeout to reject promise if not resolved
        timer = setTimeout((): void => {
            reject(timeOutObject);
        }, ms);

        promise
            .then((res): void => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err): void => {
                clearTimeout(timer);
                reject(err);
            });
    });

    const cancelTimer = (): void => {
        clearTimeout(timer);
    };

    return {
        promise: promiseTimer,
        cancel: cancelTimer
    };
};

export default promiseTimeout;
