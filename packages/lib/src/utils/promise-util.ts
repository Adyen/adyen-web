/**
 * Type guard used on Promise.allSettled to define is Promise is fulfilled
 */
const isFulfilled = <T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

/**
 * Type guard used on Promise.allSettled to define is Promise is rejected
 */
const isRejected = <T>(p: PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

export { isFulfilled, isRejected };
