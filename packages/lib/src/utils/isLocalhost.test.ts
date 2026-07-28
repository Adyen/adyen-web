import isLocalhost from './isLocalhost';

describe('isLocalhost', () => {
    test('should return true when the page runs on localhost', () => {
        // Default jsdom origin is http://localhost
        expect(isLocalhost()).toBe(true);
    });
});
