/**
 * @jest-environment-options {"url": "http://www.mycustomdomain.com/"}
 *
 * jsdom v26 makes window.location unforgeable, so the page origin can no longer be mocked
 * at runtime. This file sets an insecure (non-localhost) http origin via the jsdom `url`
 * environment option to verify initCSF warns about running from an insecure context.
 */
import initCSF from './index';
import * as logger from '../utilities/logger';

beforeEach(() => {
    /* @ts-ignore prefer-const */
    console.error = logger.error = jest.fn(error => {
        throw new Error(error);
    });
    /* @ts-ignore prefer-const */
    console.warn = logger.warn = jest.fn(error => {
        throw new Error(error);
    });
    /* @ts-ignore prefer-const */
    console.log = logger.log = jest.fn(() => {});
});

describe('Calling initCSF from an insecure http origin', () => {
    test('initializing with a custom http origin should throw an error', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        expect(() => initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card' })).toThrow(/WARNING: you are are running from an insecure context:/);
    });
});
