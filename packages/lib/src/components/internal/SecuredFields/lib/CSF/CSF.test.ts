import CSF from './CSF';
import { CSFReturnObject } from './types';
import postMessageToIframe from './utils/iframes/postMessageToIframe';
import * as logger from '../utilities/logger';

jest.mock('./utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

/**
 * Builds a fake 'this' for CSF.prototype.createReturnObject, mirroring the convention used by the
 * other CSF partial/extension tests (e.g. handleBrandFromBinLookup.test.ts) rather than constructing
 * a real CSF instance (which would trigger the full iframe-creation lifecycle).
 */
const buildCSF = (stateOverrides: Record<string, unknown> = {}, configOverrides: Record<string, unknown> = {}) => {
    const rootNode = document.createElement('div');
    rootNode.innerHTML = '<div data-cse="encryptedSecurityCode"></div>';

    return {
        state: {
            type: 'card',
            isConfigured: false,
            numIframes: 2,
            iframeCount: 2,
            securedFields: {
                encryptedCardNumber: { hasError: false, errorType: '', numKey: 1, isOptionalOrHidden: jest.fn(() => false), destroy: jest.fn() }
            },
            isKCP: false,
            ...stateOverrides
        },
        config: { loadingContext: 'test', isCreditCardType: true, ...configOverrides },
        props: { rootNode },
        callbacks: { onAdditionalSFRemoved: jest.fn() },
        postMessageToAllIframes: jest.fn(),
        setFocusOnFrame: jest.fn(),
        destroySecuredFields: jest.fn(),
        handleBrandFromBinLookup: jest.fn(),
        setupSecuredField: jest.fn()
    };
};

const createReturnObject = (csf: ReturnType<typeof buildCSF>): CSFReturnObject => CSF.prototype.createReturnObject.call(csf);

describe('CSF.createReturnObject', () => {
    beforeEach(() => {
        mockedPostMessageToIframe.mockClear();
        jest.spyOn(logger, 'warn')
            .mockClear()
            .mockImplementation(() => {});
    });

    describe('updateStyles()', () => {
        test('should warn instead of posting a message to the iframes when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).updateStyles({});
            expect(csf.postMessageToAllIframes).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should post the style object to all iframes when configured', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).updateStyles({ base: {} });
            expect(csf.postMessageToAllIframes).toHaveBeenCalledWith({ styleObject: { base: {} } });
        });
    });

    describe('setFocusOnFrame()', () => {
        test('should warn instead of setting focus when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).setFocusOnFrame('encryptedCardNumber');
            expect(csf.setFocusOnFrame).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should set focus on the given field when configured', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).setFocusOnFrame('encryptedCardNumber');
            expect(csf.setFocusOnFrame).toHaveBeenCalledWith('encryptedCardNumber');
        });
    });

    describe('isValidated()', () => {
        test('should warn instead of flagging the field as having an error when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).isValidated('encryptedCardNumber', 'some.error.code');
            expect(csf.state.securedFields.encryptedCardNumber.hasError).toBe(false);
            expect(mockedPostMessageToIframe).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should flag an existing field as having an error and inform the iframe when configured', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).isValidated('encryptedCardNumber', 'some.error.code');

            const field = csf.state.securedFields.encryptedCardNumber;
            expect(field.hasError).toBe(true);
            expect(field.errorType).toBe('isValidated');
            expect(mockedPostMessageToIframe).toHaveBeenCalledWith(
                expect.objectContaining({ txVariant: 'card', fieldType: 'encryptedCardNumber', externalValidation: true, code: 'some.error.code' }),
                null,
                'test'
            );
        });

        test('should not set an errorType if one is already present', () => {
            const csf = buildCSF({ isConfigured: true });
            csf.state.securedFields.encryptedCardNumber.errorType = 'existingError';

            createReturnObject(csf).isValidated('encryptedCardNumber', 'some.error.code');

            expect(csf.state.securedFields.encryptedCardNumber.errorType).toBe('existingError');
        });

        test('should do nothing for a field that does not exist', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).isValidated('encryptedExpiryDate', 'some.error.code');
            expect(mockedPostMessageToIframe).not.toHaveBeenCalled();
        });
    });

    describe('hasUnsupportedCard()', () => {
        test('should warn instead of flagging the field as having an error when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).hasUnsupportedCard('encryptedCardNumber', 'mc');
            expect(csf.state.securedFields.encryptedCardNumber.hasError).toBe(false);
            expect(mockedPostMessageToIframe).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should flag an existing field as having an error when passed a code', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).hasUnsupportedCard('encryptedCardNumber', 'mc');

            const field = csf.state.securedFields.encryptedCardNumber;
            expect(field.hasError).toBe(true);
            expect(field.errorType).toBe('mc');
            expect(mockedPostMessageToIframe).toHaveBeenCalledWith(
                expect.objectContaining({ txVariant: 'card', fieldType: 'encryptedCardNumber', unsupportedCard: true, code: 'mc' }),
                null,
                'test'
            );
        });

        test('should clear the error from an existing field when passed an empty code', () => {
            const csf = buildCSF({ isConfigured: true });
            csf.state.securedFields.encryptedCardNumber.hasError = true;
            csf.state.securedFields.encryptedCardNumber.errorType = 'mc';

            createReturnObject(csf).hasUnsupportedCard('encryptedCardNumber', '');

            const field = csf.state.securedFields.encryptedCardNumber;
            expect(field.hasError).toBe(false);
            expect(field.errorType).toBe('');
        });

        test('should do nothing for a field that does not exist', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).hasUnsupportedCard('encryptedExpiryDate', 'mc');
            expect(mockedPostMessageToIframe).not.toHaveBeenCalled();
        });
    });

    describe('destroy()', () => {
        test('should warn instead of destroying the secured fields when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).destroy();
            expect(csf.destroySecuredFields).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should destroy the secured fields when configured', () => {
            const csf = buildCSF({ isConfigured: true });
            createReturnObject(csf).destroy();
            expect(csf.destroySecuredFields).toHaveBeenCalled();
        });
    });

    describe('brandsFromBinLookup()', () => {
        test('should warn instead of delegating to handleBrandFromBinLookup when not yet configured', () => {
            const csf = buildCSF();
            createReturnObject(csf).brandsFromBinLookup({ issuingCountryCode: 'US' }, null);
            expect(csf.handleBrandFromBinLookup).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalled();
        });

        test('should delegate to handleBrandFromBinLookup for a credit card type', () => {
            const csf = buildCSF({ isConfigured: true }, { isCreditCardType: true });
            createReturnObject(csf).brandsFromBinLookup({ issuingCountryCode: 'US' }, null);
            expect(csf.handleBrandFromBinLookup).toHaveBeenCalledWith({ issuingCountryCode: 'US' }, null);
        });

        test('should return early for a non credit card type, regardless of being configured', () => {
            const csf = buildCSF({ isConfigured: true }, { isCreditCardType: false });
            createReturnObject(csf).brandsFromBinLookup({ issuingCountryCode: 'US' }, null);
            expect(csf.handleBrandFromBinLookup).not.toHaveBeenCalled();
            expect(logger.warn).not.toHaveBeenCalled();
        });
    });

    describe('addSecuredField()', () => {
        test('should set up a new secured field and increment numIframes when found in the rootNode', () => {
            const csf = buildCSF({ isConfigured: true, numIframes: 2 });
            createReturnObject(csf).addSecuredField('encryptedSecurityCode');

            expect(csf.state.numIframes).toBe(3);
            expect(csf.setupSecuredField).toHaveBeenCalledWith(csf.props.rootNode.querySelector('[data-cse="encryptedSecurityCode"]'));
        });

        test('should do nothing when the field cannot be found in the rootNode', () => {
            const csf = buildCSF({ isConfigured: true, numIframes: 2 });
            createReturnObject(csf).addSecuredField('encryptedPassword');

            expect(csf.state.numIframes).toBe(2);
            expect(csf.setupSecuredField).not.toHaveBeenCalled();
        });
    });

    describe('removeSecuredField()', () => {
        test('should destroy & remove an existing field, decrement counts and notify the callback', () => {
            const csf = buildCSF({ isConfigured: true, numIframes: 2, iframeCount: 2 });
            const field = csf.state.securedFields.encryptedCardNumber;

            createReturnObject(csf).removeSecuredField('encryptedCardNumber');

            expect(field.destroy).toHaveBeenCalled();
            expect(csf.state.securedFields.encryptedCardNumber).toBeUndefined();
            expect(csf.state.numIframes).toBe(1);
            expect(csf.state.iframeCount).toBe(1);
            expect(csf.callbacks.onAdditionalSFRemoved).toHaveBeenCalledWith({
                additionalIframeRemoved: true,
                fieldType: 'encryptedCardNumber',
                type: 'card'
            });
        });

        test('should do nothing for a field that does not exist', () => {
            const csf = buildCSF({ isConfigured: true, numIframes: 2, iframeCount: 2 });

            createReturnObject(csf).removeSecuredField('encryptedExpiryDate');

            expect(csf.state.numIframes).toBe(2);
            expect(csf.state.iframeCount).toBe(2);
            expect(csf.callbacks.onAdditionalSFRemoved).not.toHaveBeenCalled();
        });
    });

    describe('setKCPStatus()', () => {
        test('should update the isKCP flag in state', () => {
            const csf = buildCSF({ isConfigured: true, isKCP: false });
            createReturnObject(csf).setKCPStatus(true);
            expect(csf.state.isKCP).toBe(true);
        });
    });

    describe('sfIsOptionalOrHidden()', () => {
        test('should delegate to the secured field of the given type', () => {
            const csf = buildCSF({ isConfigured: true });
            const result = createReturnObject(csf).sfIsOptionalOrHidden('encryptedCardNumber');

            expect(result).toBe(false);
            expect(csf.state.securedFields.encryptedCardNumber.isOptionalOrHidden).toHaveBeenCalled();
        });
    });
});
