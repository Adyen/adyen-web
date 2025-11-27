import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { ANALYTICS_PATH } from './constants';
import { AnalyticsInfoEvent, InfoEventType } from './events/AnalyticsInfoEvent';
import { AnalyticsLogEvent, LogEventType } from './events/AnalyticsLogEvent';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from './events/AnalyticsErrorEvent';

describe('EventsQueue', () => {
    let queue: EventsQueueModule;

    beforeEach(() => {
        queue = EventsQueue({ analyticsContext: 'https://mydomain.com', clientKey: 'test_client_key', analyticsPath: ANALYTICS_PATH });
    });

    describe('Adding events to their respective queues', () => {
        test('should add to log queue', () => {
            const queue = EventsQueue({ analyticsContext: 'https://mydomain.com', clientKey: 'fsdjkh', analyticsPath: ANALYTICS_PATH });
            const event = new AnalyticsLogEvent({ type: LogEventType.action, component: 'card', message: '3DS2 showed' });
            queue.add(event);
            expect(queue.getQueue().logs.length).toBe(1);
        });

        test('should add to info queue', () => {
            const event = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'scheme' });
            queue.add(event);
            expect(queue.getQueue().info.length).toBe(1);
        });

        test('should add to error queue', () => {
            const event = new AnalyticsErrorEvent({
                code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
                component: 'card',
                errorType: ErrorEventType.apiError,
                message: '3DS2 error'
            });
            queue.add(event);
            expect(queue.getQueue().errors.length).toBe(1);
        });
    });

    describe('Flushing events', () => {
        test('run flushes the queue', () => {
            queue.add(new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'scheme' }));
            queue.add(new AnalyticsLogEvent({ type: LogEventType.action, component: 'card', message: '3DS2 showed' }));
            queue.add(
                new AnalyticsErrorEvent({
                    code: ErrorEventCode.REDIRECT,
                    component: 'redirect',
                    errorType: ErrorEventType.apiError,
                    message: 'redirect'
                })
            );

            expect(queue.getQueue().logs.length).toBe(1);
            expect(queue.getQueue().info.length).toBe(1);
            expect(queue.getQueue().errors.length).toBe(1);

            void queue.run('mocked-attempt-id');

            expect(queue.getQueue().logs.length).toBe(0);
            expect(queue.getQueue().info.length).toBe(0);
            expect(queue.getQueue().errors.length).toBe(0);
        });
    });
});
