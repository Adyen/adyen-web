import { AnalyticsEventQueue } from './AnalyticsEventQueue';
import { AnalyticsInfoEvent, InfoEventType } from './events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventType } from './events/AnalyticsErrorEvent';
import { AnalyticsLogEvent, LogEventType } from './events/AnalyticsLogEvent';

describe('AnalyticsEventQueue', () => {
    let queue: AnalyticsEventQueue;

    beforeEach(() => {
        queue = new AnalyticsEventQueue();
    });

    describe('add()', () => {
        test('should add info events to the info queue', () => {
            const infoEvent = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'card'
            });

            queue.add(infoEvent);

            expect(queue.infoEvents).toHaveLength(1);
            expect(queue.infoEvents[0]).toBe(infoEvent);
            expect(queue.errorEvents).toHaveLength(0);
            expect(queue.logEvents).toHaveLength(0);
        });

        test('should add error events to the errors queue', () => {
            const errorEvent = new AnalyticsErrorEvent({
                component: 'card',
                errorType: ErrorEventType.network,
                code: '500'
            });

            queue.add(errorEvent);

            expect(queue.errorEvents).toHaveLength(1);
            expect(queue.errorEvents[0]).toBe(errorEvent);
            expect(queue.infoEvents).toHaveLength(0);
            expect(queue.logEvents).toHaveLength(0);
        });

        test('should add log events to the logs queue', () => {
            const logEvent = new AnalyticsLogEvent({
                type: LogEventType.submit,
                component: 'card',
                message: 'Payment submitted'
            });

            queue.add(logEvent);

            expect(queue.logEvents).toHaveLength(1);
            expect(queue.logEvents[0]).toBe(logEvent);
            expect(queue.infoEvents).toHaveLength(0);
            expect(queue.errorEvents).toHaveLength(0);
        });

        test('should add multiple events of the same type', () => {
            const infoEvent1 = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'card'
            });
            const infoEvent2 = new AnalyticsInfoEvent({
                type: InfoEventType.clicked,
                component: 'ideal'
            });

            queue.add(infoEvent1);
            queue.add(infoEvent2);

            expect(queue.infoEvents).toHaveLength(2);
            expect(queue.infoEvents[0]).toBe(infoEvent1);
            expect(queue.infoEvents[1]).toBe(infoEvent2);
        });

        test('should add events of different types to their respective queues', () => {
            const infoEvent = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'card'
            });
            const errorEvent = new AnalyticsErrorEvent({
                component: 'card',
                errorType: ErrorEventType.network,
                code: '500'
            });
            const logEvent = new AnalyticsLogEvent({
                type: LogEventType.submit,
                component: 'card',
                message: 'Payment submitted'
            });

            queue.add(infoEvent);
            queue.add(errorEvent);
            queue.add(logEvent);

            expect(queue.infoEvents).toHaveLength(1);
            expect(queue.errorEvents).toHaveLength(1);
            expect(queue.logEvents).toHaveLength(1);
        });
    });

    describe('clear()', () => {
        test('should clear all queues', () => {
            const infoEvent = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'card'
            });
            const errorEvent = new AnalyticsErrorEvent({
                component: 'card',
                errorType: ErrorEventType.network,
                code: '500'
            });
            const logEvent = new AnalyticsLogEvent({
                type: LogEventType.submit,
                component: 'card',
                message: 'Payment submitted'
            });

            queue.add(infoEvent);
            queue.add(errorEvent);
            queue.add(logEvent);

            queue.clear();

            expect(queue.infoEvents).toHaveLength(0);
            expect(queue.errorEvents).toHaveLength(0);
            expect(queue.logEvents).toHaveLength(0);
        });

        test('should allow adding events after clearing', () => {
            const infoEvent1 = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'card'
            });

            queue.add(infoEvent1);
            queue.clear();

            const infoEvent2 = new AnalyticsInfoEvent({
                type: InfoEventType.clicked,
                component: 'ideal'
            });
            queue.add(infoEvent2);

            expect(queue.infoEvents).toHaveLength(1);
            expect(queue.infoEvents[0]).toBe(infoEvent2);
        });
    });

    describe('getters', () => {
        test('should return empty arrays when no events have been added', () => {
            expect(queue.infoEvents).toEqual([]);
            expect(queue.errorEvents).toEqual([]);
            expect(queue.logEvents).toEqual([]);
        });

        test('should return the same array reference on multiple calls', () => {
            const infoEvents1 = queue.infoEvents;
            const infoEvents2 = queue.infoEvents;

            expect(infoEvents1).toBe(infoEvents2);
        });
    });
});
