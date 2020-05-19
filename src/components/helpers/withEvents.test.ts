import withEvents from './withEvents';

describe('withEvents', () => {
    test('adds pub/sub to a class', () => {
        const myClass = class MyClass {};
        const myClassWithEvents = withEvents(myClass);
        const myObject = new myClassWithEvents({});

        expect(typeof myObject.on === 'function').toBe(true);
        expect(typeof myObject.off === 'function').toBe(true);
        expect(typeof myObject.events === 'object').toBe(true);
        expect(typeof myObject.emit === 'function').toBe(true);
    });

    test('add/remove events', () => {
        const myClass = class MyClass {};
        const myClassWithEvents = withEvents(myClass);
        const myObject = new myClassWithEvents({});
        const eventFunction = jest.fn();

        myObject.on('test', eventFunction);
        expect(myObject.events['test'].length).toBe(1);

        myObject.off('test', eventFunction);
        expect(myObject.events['test'].length).toBe(0);
    });

    test('calls events on emit', () => {
        const myClass = class MyClass {};
        const myClassWithEvents = withEvents(myClass);
        const myObject = new myClassWithEvents({});
        const eventFunction = jest.fn();

        myObject.on('test', eventFunction);
        expect(myObject.events['test'].length).toBe(1);

        myObject.emit('test', {});
        expect(eventFunction.mock.calls.length).toBe(1);
    });
});
