import initCSF from './index';
import * as logger from '../utilities/logger';

beforeEach(() => {
    console.error = logger.error = jest.fn(error => {
        throw new Error(error);
    });
    console.warn = logger.warn = jest.fn(error => {
        throw new Error(error);
    });
    console.log = logger.log = jest.fn(() => {});
});

describe('Calling initCSF', () => {
    test('initializing without a setup object should throw an error', () => {
        expect(() => initCSF(null)).toThrow('No securedFields configuration object defined');
    });

    test('initializing with a setup object missing a rootNode property should throw an error', () => {
        expect(() => initCSF({})).toThrow('ERROR: SecuredFields configuration object is missing a "rootNode" property');
    });

    test('initializing with a setup object missing a clientKey property should throw an error', () => {
        expect(() => initCSF({ rootNode: {} })).toThrow('WARNING: AdyenCheckout configuration object is missing a "clientKey" property.');
    });

    test("initializing with a setup object whose rootNode property can't be found should throw an error", () => {
        expect(() => initCSF({ rootNode: '.my-non-existent-div', clientKey: 'fsdg', type: 'card' })).toThrow(
            /^ERROR: SecuredFields cannot find a valid rootNode element for card$/
        ); // Using a regEx (w. line start & end markers) to test the exact error message
    });

    test('initializing with a custom http origin should throw an error', () => {
        global['window'] = Object.create(window);
        const url = 'http://www.mycustomdomain.com';
        Object.defineProperty(window, 'location', {
            value: {
                origin: url
            },
            writable: true
        });

        expect(() => initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card' })).toThrow(/WARNING: you are are running from an insecure context:/);
    });

    test('initializing with a local http origin should be ok and CSF should be initialised but then throw a loadingContext error', () => {
        const url = 'http://localhost';
        Object.defineProperty(window, 'location', {
            value: {
                origin: url
            }
        });

        expect(() => initCSF({ rootNode: {}, clientKey: 'fsdg', type: 'card' })).toThrow(/WARNING Config :: no loadingContext has been specified!/);
    });

    test('initializing correctly should lead to the return of a CSF object exposing key functions', () => {
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
});
