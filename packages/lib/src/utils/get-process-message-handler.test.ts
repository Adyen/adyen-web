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
        expect(processEvent(event)).toBe('Event data was not of type string');
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
        expect(processEvent(event)).toBe('Invalid event data string');
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
        expect(processEvent(event)).toBe('Event data was not of expected type');
        expect(resolveFunction.mock.calls.length).toBe(0);
    });
});
