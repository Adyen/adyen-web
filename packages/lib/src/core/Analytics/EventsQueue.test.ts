import EventsQueue from './EventsQueue';
import { ANALYTICS_PATH } from './constants';
import { AnalyticsInfoEvent, InfoEventType } from './events/AnalyticsInfoEvent';

const event = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'scheme' });

describe('CAEventsQueue', () => {
    const queue = EventsQueue({ analyticsContext: 'https://mydomain.com', clientKey: 'fsdjkh', analyticsPath: ANALYTICS_PATH });

    test('adds log to the queue', () => {
        queue.add('logs', event);
        expect(queue.getQueue().logs.length).toBe(1);
    });

    test('adds event to the queue', () => {
        queue.add('info', event);
        expect(queue.getQueue().info.length).toBe(1);
    });

    test('adds error to the queue', () => {
        queue.add('errors', event);
        expect(queue.getQueue().errors.length).toBe(1);
    });

    test('run flushes the queue', () => {
        void queue.run('checkoutAttemptId');

        expect(queue.getQueue().logs.length).toBe(0);
        expect(queue.getQueue().info.length).toBe(0);
        expect(queue.getQueue().errors.length).toBe(0);
    });
});
