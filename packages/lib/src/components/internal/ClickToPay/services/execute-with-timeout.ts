import TimeoutError from '../errors/TimeoutError';

function executeWithTimeout<T>(asyncFn: () => Promise<T>, timer: number, error: TimeoutError): Promise<T> {
    let timeout = null;
    const wait = (seconds: number) =>
        new Promise<T>((_, reject) => {
            timeout = setTimeout(() => reject(error), seconds);
        });
    return Promise.race<T>([asyncFn(), wait(timer)])
        .then(value => {
            clearTimeout(timeout);
            return value;
        })
        .catch(error => {
            clearTimeout(timeout);
            throw error;
        });
}
export { executeWithTimeout };
