import CheckoutSession from './CheckoutSession';
import { httpPost } from '../Services/http';

jest.mock('../Services/http');
const clientKeyMock = 'test_123';
const rawSessionMock = { id: '123', sessionData: 'dummy' };

const successResponseMock = {
    configuration: {},
    sessionData: 'newSessionData'
};

const httpPostMock = (httpPost as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(successResponseMock)));

describe('CheckoutSession', () => {
    describe('constructor', () => {
        test('should throw an error if there is no client key', () => {
            try {
                new CheckoutSession(rawSessionMock, undefined, 'test');
            } catch (e) {
                expect(e).toHaveProperty('message', 'No clientKey available');
            }
        });
        test('should throw an error if there is no loadingContext', () => {
            try {
                new CheckoutSession(rawSessionMock, clientKeyMock, undefined);
            } catch (e) {
                expect(e).toHaveProperty('message', 'No loadingContext available');
            }
        });
        test('should restore the session data from the localStorage if there is no session data when initiating', () => {
            const storedSession = { id: '123', sessionData: 'stored' };
            window.localStorage.setItem('adyen-checkout__session', JSON.stringify(storedSession));

            const session = new CheckoutSession({ id: '123' }, clientKeyMock, 'test');
            expect(session.data).toEqual(storedSession.sessionData);
            window.localStorage.removeItem('adyen-checkout__session');
        });
    });

    describe('setupSession', () => {
        test('should call the http post with the correct parameters', async () => {
            const session = new CheckoutSession(rawSessionMock, clientKeyMock, 'test');
            await session.setupSession({});
            expect(httpPostMock).toHaveBeenCalledWith(
                { loadingContext: 'test', path: `v1/sessions/${rawSessionMock.id}/setup?clientKey=${clientKeyMock}`, errorLevel: 'fatal' },
                { sessionData: rawSessionMock.sessionData, browserInfo: expect.anything() }
            );
        });

        test('should update the session data if response contains new session data', async () => {
            const session = new CheckoutSession(rawSessionMock, clientKeyMock, 'test');
            expect(session.data).toBe(rawSessionMock.sessionData);

            await session.setupSession({});
            expect(session.data).toBe(successResponseMock.sessionData);
        });
    });
});
