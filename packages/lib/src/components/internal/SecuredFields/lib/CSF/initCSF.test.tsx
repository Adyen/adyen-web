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

describe('Calling initCSF', () => {
    test('initializing without a setup object should throw an error', () => {
        expect(() => initCSF(null)).toThrow('No securedFields configuration object defined');
    });

    test('initializing with a setup object missing a rootNode property should throw an error', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        expect(() => initCSF({})).toThrow('ERROR: SecuredFields configuration object is missing a "rootNode" property');
    });

    test('initializing with a setup object missing a clientKey property should throw an error', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        expect(() => initCSF({ rootNode: {} })).toThrow('WARNING: AdyenCheckout configuration object is missing a "clientKey" property.');
    });

    test("initializing with a setup object whose rootNode property can't be found should throw an error", () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        expect(() => initCSF({ rootNode: '.my-non-existent-div', clientKey: 'fsdg', type: 'card' })).toThrow(
            /^ERROR: SecuredFields cannot find a valid rootNode element for card$/
        ); // Using a regEx (w. line start & end markers) to test the exact error message
    });

    // Note: the "insecure http origin" scenario lives in initCSF.insecureContext.test.tsx because jsdom v26
    // makes window.location unforgeable; the origin can only be controlled per-file via @jest-environment-options.

    test('initializing with a local http origin should be ok and CSF should be initialised but then throw a loadingContext error', () => {
        // Default jsdom origin is http://localhost, which is treated as a secure local context.
        /* @ts-ignore deliberately-not-implementing-all-members */
        expect(() => initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card' })).toThrow(/WARNING Config :: no loadingContext has been specified!/);
    });

    test('initializing correctly (for a "card") should lead to the return of a CSF object exposing key functions', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        const csf = initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card', loadingContext: 'http' });

        expect(csf).toHaveProperty('updateStyles');
        expect(csf).toHaveProperty('setFocusOnFrame');
        expect(csf).toHaveProperty('isValidated');
        expect(csf).toHaveProperty('hasUnsupportedCard');
        expect(csf).toHaveProperty('destroy');
        expect(csf).toHaveProperty('brandsFromBinLookup');
        expect(csf).toHaveProperty('addSecuredField');
        expect(csf).toHaveProperty('removeSecuredField');
        expect(csf).toHaveProperty('setKCPStatus');
        expect(csf).toHaveProperty('sfIsOptionalOrHidden');
    });

    test('initializing correctly (for a non-card) should lead to the return of a CSF object exposing key functions', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        const csf = initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'ach', loadingContext: 'http' });

        expect(csf).toHaveProperty('updateStyles');
        expect(csf).toHaveProperty('setFocusOnFrame');
        expect(csf).toHaveProperty('isValidated');
        expect(csf).toHaveProperty('hasUnsupportedCard');
        expect(csf).toHaveProperty('destroy');
        expect(csf).toHaveProperty('brandsFromBinLookup');
        expect(csf).toHaveProperty('addSecuredField');
        expect(csf).toHaveProperty('removeSecuredField');
        expect(csf).toHaveProperty('setKCPStatus');
        expect(csf).toHaveProperty('sfIsOptionalOrHidden');
    });

    test('initializing for a "card" with one brand should lead to the return of a CSF object exposing key functions', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        const csf = initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card', loadingContext: 'http', cardGroupTypes: ['mc'] });

        expect(csf).toHaveProperty('updateStyles');
        expect(csf).toHaveProperty('setFocusOnFrame');
        expect(csf).toHaveProperty('isValidated');
        expect(csf).toHaveProperty('hasUnsupportedCard');
        expect(csf).toHaveProperty('destroy');
        expect(csf).toHaveProperty('brandsFromBinLookup');
        expect(csf).toHaveProperty('addSecuredField');
        expect(csf).toHaveProperty('removeSecuredField');
        expect(csf).toHaveProperty('setKCPStatus');
        expect(csf).toHaveProperty('sfIsOptionalOrHidden');
    });

    test('initializing for a "card" with one unrecognised brand should lead to the return of a CSF object exposing key functions', () => {
        /* @ts-ignore deliberately-not-implementing-all-members */
        const csf = initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card', loadingContext: 'http', cardGroupTypes: ['madeupcard'] });

        expect(csf).toHaveProperty('updateStyles');
        expect(csf).toHaveProperty('setFocusOnFrame');
        expect(csf).toHaveProperty('isValidated');
        expect(csf).toHaveProperty('hasUnsupportedCard');
        expect(csf).toHaveProperty('destroy');
        expect(csf).toHaveProperty('brandsFromBinLookup');
        expect(csf).toHaveProperty('addSecuredField');
        expect(csf).toHaveProperty('removeSecuredField');
        expect(csf).toHaveProperty('setKCPStatus');
        expect(csf).toHaveProperty('sfIsOptionalOrHidden');
    });
});
