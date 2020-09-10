import uuid from './uuid';

describe('uuid', () => {
    test('should generate a UUID of 36 characters', () => {
        const id = uuid();
        expect(id.length).toBe(36);
    });

    test('UUIDs are unique', () => {
        const id = uuid();
        const id2 = uuid();
        expect(id).not.toBe(id2);
    });
});
