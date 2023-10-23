import EventsQueue from './EventsQueue';
import { ANALYTICS_PATH } from './constants';

const task1 = { foo: 'bar', timestamp: '1234', component: 'scheme' };

describe('CAEventsQueue', () => {
    const queue = EventsQueue({ analyticsContext: 'https://mydomain.com', clientKey: 'fsdjkh', analyticsPath: ANALYTICS_PATH });

    test('adds log to the queue', () => {
        queue.add('logs', task1);
        expect(queue.getQueue().logs.length).toBe(1);
    });

    test('adds event to the queue', () => {
        queue.add('events', task1);
        expect(queue.getQueue().events.length).toBe(1);
    });

    test('adds error to the queue', () => {
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
