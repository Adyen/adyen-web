import CAEventsQueue from './CAEventsQueue';

describe('CAEventsQueue', () => {
    const queue = CAEventsQueue({ analyticsContext: 'https://mydomain.com', clientKey: 'fsdjkh' });

    test('adds log to the queue', () => {
        const task1 = { foo: 'bar' };
        queue.add('logs', task1);
        expect(queue.getQueue().logs.length).toBe(1);
    });

    test('adds event to the queue', () => {
        const task1 = { foo: 'bar' };
        queue.add('events', task1);
        expect(queue.getQueue().events.length).toBe(1);
    });

    test('adds error to the queue', () => {
        const task1 = { foo: 'bar' };
        queue.add('errors', task1);
        expect(queue.getQueue().errors.length).toBe(1);
    });

    test('run flushes the queue', () => {
        queue.run('checkoutAttemptId');

        expect(queue.getQueue().logs.length).toBe(0);
        expect(queue.getQueue().events.length).toBe(0);
        expect(queue.getQueue().errors.length).toBe(0);
    });
});
