import { default as EventsQueue } from './EventsQueue';

describe('EventsQueue', () => {
    let queue;

    beforeEach(() => {
        queue = new EventsQueue();
    });

    test('adds events to the queue', () => {
        const task1 = () => jest.fn();
        queue.add(task1);
        expect(queue.events.length).toBe(1);
    });

    test('run flushes the queue', () => {
        const task1 = () => jest.fn();
        queue.add(task1);
        expect(queue.events.length).toBe(1);
        queue.run();
        expect(queue.events.length).toBe(0);
    });
});
