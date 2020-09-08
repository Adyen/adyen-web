import { processResponse } from './process-response';

describe('processResponse', () => {
    test('processes a complete response', () => {
        const response = { type: 'complete', resultCode: 'Authorised' };
        expect(processResponse(response)).toHaveProperty('type', 'success');
    });

    test('processes a validation response', () => {
        const response = { type: 'validation', resultCode: '' };
        expect(processResponse(response)).toHaveProperty('type', 'error');
    });

    test('processes an unknown response', () => {
        const response = { type: '?', resultCode: '' };
        expect(processResponse(response)).toHaveProperty('type', 'error');
    });

    test('processes a pending response', () => {
        const response = { type: 'complete', resultCode: 'pending' };
        expect(processResponse(response)).toHaveProperty('type', 'pending');
    });

    test('processes a pending response', () => {
        const response = { type: 'pending', resultCode: '' };
        expect(processResponse(response)).toHaveProperty('type', 'pending');
    });

    test('processes a received response', () => {
        const response = { type: 'complete', resultCode: 'received' };
        expect(processResponse(response)).toHaveProperty('type', 'received');
    });
});
