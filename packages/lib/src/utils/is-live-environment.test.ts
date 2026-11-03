import { isLiveEnvironment } from './is-live-environment';

describe('isLiveEnvironment', () => {
    test.each(['live', 'LIVE', 'Live', 'live-us', 'live-au', 'live-apse', 'live-in', 'live-nea'])('should return true for %s', environment => {
        expect(isLiveEnvironment(environment)).toBe(true);
    });

    test.each(['test', 'TEST', 'beta', '', undefined])('should return false for %s', environment => {
        expect(isLiveEnvironment(environment)).toBe(false);
    });
});
