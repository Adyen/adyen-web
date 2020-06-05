import EventEmitter from './EventEmitter';

describe('EventEmitter', () => {
    test('add/remove events', () => {
        const myObject = new EventEmitter();
        const eventFunction = jest.fn();

        myObject.on('test', eventFunction);
        expect(myObject.events['test'].length).toBe(1);

        myObject.off('test', eventFunction);
        expect(myObject.events['test'].length).toBe(0);
    });

    test('calls events on emit', () => {
        const myObject = new EventEmitter();
        const eventFunction = jest.fn();

        myObject.on('test', eventFunction);
        expect(myObject.events['test'].length).toBe(1);

        myObject.emit('test', {});
        expect(eventFunction.mock.calls.length).toBe(1);
    });
});
