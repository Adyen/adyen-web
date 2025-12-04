import { http, httpGet, httpPost } from './http';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('http', () => {
    const loadingContext = 'https://api.example.com/';
    const path = 'v1/test';

    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('successful requests', () => {
        test('should return parsed JSON data on successful response', async () => {
            const responseData = { success: true, data: 'test' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(responseData)
            });

            const result = await http({ loadingContext, path });

            expect(result).toEqual(responseData);
            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/v1/test', expect.objectContaining({ method: 'GET' }));
        });

        test('should return undefined for 204 No Content response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204
            });

            const result = await http({ loadingContext, path });

            expect(result).toBeUndefined();
        });
    });

    describe('request configuration', () => {
        test('should use POST method and send JSON body when data is provided', async () => {
            const requestData = { key: 'value' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });

            await http({ loadingContext, path, method: 'POST' }, requestData);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/v1/test',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestData),
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        test('should use text/plain content type for GET requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });

            await http({ loadingContext, path, method: 'GET' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'text/plain'
                    })
                })
            );
        });

        test('should merge custom headers', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });

            await http({ loadingContext, path, headers: { 'X-Custom-Header': 'custom-value' } });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Custom-Header': 'custom-value'
                    })
                })
            );
        });
    });

    describe('error handling', () => {
        test('should throw AdyenCheckoutError on network failure with fatal error level', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(http({ loadingContext, path, errorLevel: 'fatal' })).rejects.toThrow(AdyenCheckoutError);
        });

        test('should log warning and not throw for warn error level', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await http({ loadingContext, path, errorLevel: 'warn' });

            expect(console.warn).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test('should log error and not throw for error level', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await http({ loadingContext, path, errorLevel: 'error' });

            expect(console.error).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test('should log info and not throw for info error level', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await http({ loadingContext, path, errorLevel: 'info' });

            expect(console.info).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test('should not log anything for silent error level', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await http({ loadingContext, path, errorLevel: 'silent' });

            expect(console.warn).not.toHaveBeenCalled();
            expect(console.error).not.toHaveBeenCalled();
            expect(console.info).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test('should use custom error message when provided', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            const customMessage = 'Custom error message';

            await http({ loadingContext, path, errorLevel: 'warn', errorMessage: customMessage });

            expect(console.warn).toHaveBeenCalledWith(customMessage);
        });

        test('should re-throw AdyenCheckoutError from handleFetchError', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            await expect(http({ loadingContext, path, errorLevel: 'fatal' })).rejects.toThrow(AdyenCheckoutError);
        });
    });

    describe('httpGet', () => {
        test('should call http with GET method', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: 'test' })
            });

            await httpGet({ loadingContext, path });

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'GET' }));
        });
    });

    describe('httpPost', () => {
        test('should call http with POST method', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: 'test' })
            });

            await httpPost({ loadingContext, path }, { key: 'value' });

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST' }));
        });
    });
});
