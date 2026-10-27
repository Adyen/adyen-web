import getProcessMessageHandler from './get-process-message-handler';

const expectedType = 'TestType';
const response = {
    type: expectedType
};

const data = JSON.stringify(response);

describe('getProcessMessageHandler', () => {
    test('called with the right properties should resolve', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();
        const event = {
            origin: 'http://fake-domain.com',
            data
        };

        const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, rejectFunction, expectedType);
        processEvent(event);

        expect(resolveFunction.mock.calls.length).toBe(1);
        expect(rejectFunction.mock.calls.length).toBe(0);
    });

    test('called with the wrong domain should return Message was not sent from the expected domain', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();

        const event = {
            origin: 'http://fake-dmain.com',
            data
        };

        const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, rejectFunction, expectedType);
        expect(processEvent(event)).toBe('Message was not sent from the expected domain');
        expect(resolveFunction.mock.calls.length).toBe(0);
    });

    test('called with the wrong data type should return Event data was not of type string', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();

        const event = {
            origin: 'http://fake-domain.com',
            data: rejectFunction
        };

        const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, rejectFunction, expectedType);
        expect(processEvent(event)).toBe('Event data from expected domain but not in expected form');
        expect(resolveFunction.mock.calls.length).toBe(0);
    });

    test('called with an empty string should return Invalid event data string', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();

        const event = {
            origin: 'http://fake-domain.com',
            data: ''
        };

        const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, rejectFunction, expectedType);
        expect(processEvent(event)).toBe('Event data from expected domain, in expected form, but empty');
        expect(resolveFunction.mock.calls.length).toBe(0);
    });

    test('called with the a type but not the expected type should return Event data was not of expected type', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();
        const notTheExpectedType = 'notThisOne';

        const event = {
            origin: 'http://fake-domain.com',
            data
        };

        const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, rejectFunction, notTheExpectedType);
        expect(processEvent(event)).toBe('Event data has "type" but the object is not in the expected form');
        expect(resolveFunction.mock.calls.length).toBe(0);
    });

    test('should ignore every message when the expected domain is null', () => {
        const resolveFunction = jest.fn();
        const rejectFunction = jest.fn();

        const event = {
            origin: 'http://fake-domain.com',
            data
        };

        const processEvent = getProcessMessageHandler(null, resolveFunction, rejectFunction, expectedType);
        expect(processEvent(event)).toBe('Message was not sent from the expected domain');
        expect(resolveFunction).toHaveBeenCalledTimes(0);
        expect(rejectFunction).toHaveBeenCalledTimes(0);
    });

    describe('with a getExpectedSource getter', () => {
        const ownWindow = {} as Window;
        const otherWindow = {} as Window;

        test('should resolve when the message comes from the expected source', () => {
            const resolveFunction = jest.fn();
            const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, jest.fn(), expectedType, () => ownWindow);

            expect(processEvent({ origin: 'http://fake-domain.com', data, source: ownWindow })).toBe(true);
            expect(resolveFunction).toHaveBeenCalledTimes(1);
        });

        test('should not resolve when the message comes from a different source', () => {
            const resolveFunction = jest.fn();
            const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, jest.fn(), expectedType, () => ownWindow);

            expect(processEvent({ origin: 'http://fake-domain.com', data, source: otherWindow })).toBe(
                'Message was not sent from the expected source'
            );
            expect(processEvent({ origin: 'http://fake-domain.com', data })).toBe('Message was not sent from the expected source');
            expect(resolveFunction).not.toHaveBeenCalled();
        });

        test('should not resolve when the expected source can no longer be found (e.g. its iframe was removed from the DOM)', () => {
            const resolveFunction = jest.fn();
            const processEvent = getProcessMessageHandler('http://fake-domain.com', resolveFunction, jest.fn(), expectedType, () => null);

            expect(processEvent({ origin: 'http://fake-domain.com', data, source: null })).toBe('Message was not sent from the expected source');
            expect(resolveFunction).not.toHaveBeenCalled();
        });
    });
});
