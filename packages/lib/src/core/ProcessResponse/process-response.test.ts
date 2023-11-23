import { processResponse } from './process-response';

describe('processResponse', () => {
    test('processes a complete response', () => {
        const response = { type: 'complete', resultCode: 'Authorised' as const };
        expect(processResponse(response)).toHaveProperty('type', 'success');
    });

    test('processes a validation response', () => {
        const response = { type: 'validation', resultCode: '' };
        // @ts-ignore Testing when resultCode is empty
        expect(processResponse(response)).toHaveProperty('type', 'error');
    });

    test('processes an unknown response', () => {
        const response = { type: '?', resultCode: '' };
        // @ts-ignore Testing when resultCode is empty
        expect(processResponse(response)).toHaveProperty('type', 'error');
    });

    test('processes a pending response', () => {
        const response = { type: 'complete', resultCode: 'Pending' as const };
        expect(processResponse(response)).toHaveProperty('type', 'pending');
    });

    test('processes a pending response', () => {
        const response = { type: 'pending', resultCode: '' };
        // @ts-ignore Testing when resultCode is empty
        expect(processResponse(response)).toHaveProperty('type', 'pending');
    });

    test('processes a received response', () => {
        const response = { type: 'complete', resultCode: 'Received' as const };
        expect(processResponse(response)).toHaveProperty('type', 'received');
    });
});
