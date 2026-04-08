import { h, createRef } from 'preact';
import { render, act } from '@testing-library/preact/pure';
import SecuredFieldsProvider from './SecuredFieldsProvider';
import { SF_ErrorCodes } from '../../../../core/Errors/constants';
import { setupResourceMock } from '../../../../../config/testMocks/resourcesMock';

jest.mock('../lib/CSF', () => {
    return () => true;
});

let sfp;
let sfpRef;

const onError = jest.fn(() => {});
const renderFn = jest.fn(() => null);

const mockNode = `
    <label>
        <span data-cse="encryptedCardNumber"></span>
    </label>
    <label>
        <span data-cse="encryptedExpiryDate"></span>
    </label>
    <label>
        <span data-cse="encryptedSecurityCode"></span>
    </label>
`;

const mockNodeTwoDateFields = `
    <label>
        <span data-cse="encryptedCardNumber"></span>
    </label>
    <label >
        <span data-cse="encryptedExpiryMonth"></span>
    </label>
    <label >
        <span data-cse="encryptedExpiryYear"></span>
    </label>
    <label>
        <span data-cse="encryptedSecurityCode"></span>
    </label>
`;

const styles = {
    base: {
        color: '#111'
    }
};

const unsupportedCardErrObj = {
    type: 'card',
    fieldType: 'encryptedCardNumber',
    error: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED,
    detectedBrands: ['cartebancaire']
};

const regularErrObj = {
    error: SF_ErrorCodes.ERROR_MSG_INCOMPLETE_FIELD,
    fieldType: 'encryptedCardNumber',
    type: 'card'
};

const mockBinLookupObj = {
    issuingCountryCode: 'US',
    supportedBrands: [
        {
            brand: 'mc',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        }
    ]
};

const nodeHolder = document.createElement('div');
nodeHolder.innerHTML = mockNode;

const brandsFromBinLookup = jest.fn(() => {});

const mockCSF = {
    hasUnsupportedCard: () => {},
    brandsFromBinLookup
};

function renderSFP(extraProps = {}) {
    sfpRef = createRef();
    render(
        <SecuredFieldsProvider
            ref={sfpRef}
            rootNode={nodeHolder}
            styles={styles}
            render={renderFn}
            onError={onError}
            i18n={global.i18n}
            configuration={{}}
            {...extraProps}
        />
    );
    sfp = sfpRef.current;
    return sfp;
}

/**
 * Rendering
 */
describe('<SecuredFieldsProvider /> rendering', () => {
    test('Loading state', async () => {
        nodeHolder.innerHTML = mockNode;
        renderSFP();

        expect(sfp.state.status).toBe('loading');
        await act(() => {
            sfp.handleOnConfigSuccess();
        });
        expect(sfp.state.status).toBe('ready');
    });

    it("should create a valid object in the SecuredFieldsProvider's state with initial properties set to false", () => {
        expect(sfp.state.valid).toHaveProperty('encryptedCardNumber', false);
        expect(sfp.state.valid).toHaveProperty('encryptedExpiryMonth', false);
        expect(sfp.state.valid).toHaveProperty('encryptedExpiryYear', false);
        expect(sfp.state.valid).toHaveProperty('encryptedSecurityCode', false);
    });

    it('should initialize an instance of adyen-secured-fields', () => {
        expect(sfp.csf).toBeDefined();
    });

    it('should create an error object for each visible secured field, pass the object to the props.onError fn & set state.errors', async () => {
        await act(() => {
            sfp.showValidation();
        });

        expect(sfp.state.errors.encryptedCardNumber).not.toBe(null);
        expect(sfp.state.errors.encryptedExpiryDate).not.toBe(null);
        expect(sfp.state.errors.encryptedSecurityCode).not.toBe(null);
    });

    it('should call the passed render function', () => {
        expect(renderFn).toHaveBeenCalled();
    });

    it('should register the presence of a date field element within the passed rootNode', () => {
        expect(sfp.numDateFields).toBe(1);
    });

    it('should register the presence of 2 date field elements within the passed rootNode', () => {
        nodeHolder.innerHTML = mockNodeTwoDateFields;

        renderSFP({ render: () => null });
        expect(sfp.numDateFields).toBe(2);
    });

    it('should return the rootNode when the getter is called', () => {
        nodeHolder.innerHTML = mockNode;
        renderSFP();

        sfp.csf = mockCSF;

        expect(sfp.getRootNode()).toEqual(nodeHolder);
    });
});

/**
 * Unsupported cards (including related errors)
 */
describe('<SecuredFieldsProvider /> handling an unsupported card', () => {
    it('should generate an "unsupported card" error that propagates to the onError callback', async () => {
        nodeHolder.innerHTML = mockNode;
        unsupportedCardErrObj.error = SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED;
        renderSFP();
        sfp.csf = mockCSF;

        let result;
        await act(() => {
            result = sfp.handleUnsupportedCard(unsupportedCardErrObj);
        });
        expect(result).toBe(true);
    });

    it('should see that the "unsupported card" error has set state on the SecuredFieldsProvider', () => {
        expect(sfp.state.detectedUnsupportedBrands.length).toEqual(1);
        expect(sfp.state.errors.encryptedCardNumber).toEqual(SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED);
    });

    it('should clear the previously generated "unsupported card" error & propagate to the onError callback', async () => {
        unsupportedCardErrObj.error = null;

        let result;
        await act(() => {
            result = sfp.handleUnsupportedCard(unsupportedCardErrObj);
        });
        expect(result).toBe(false);
    });

    it('should see that the cleared "unsupported card" error has reset state on the SecuredFieldsProvider', () => {
        expect(sfp.state.errors.encryptedCardNumber).toBe(null);
    });

    it('should clear the previously generated "unsupported card" error & then a regular error is handled correctly', async () => {
        unsupportedCardErrObj.error = null;

        await act(() => {
            sfp.handleUnsupportedCard(unsupportedCardErrObj);
        });

        let result;
        await act(() => {
            result = sfp.handleOnError(regularErrObj);
        });
        expect(result).toBe(true);

        expect(sfp.state.errors.encryptedCardNumber).toEqual(SF_ErrorCodes.ERROR_MSG_INCOMPLETE_FIELD);
    });

    it('should re-generate an "unsupported card" error and then a handleOnFieldValid call should be ignored', async () => {
        // @ts-ignore - it's a test!
        unsupportedCardErrObj.error = 'Unsupported card';
        unsupportedCardErrObj.detectedBrands = ['cartebancaire'];

        await act(() => {
            sfp.handleUnsupportedCard(unsupportedCardErrObj);
        });
        expect(sfp.state.detectedUnsupportedBrands.length).toEqual(1);

        let result;
        await act(() => {
            result = sfp.handleOnFieldValid({ fieldType: 'encryptedCardNumber' });
        });
        expect(result).toBe(false);
        expect(sfp.state.valid.encryptedCardNumber).toBe(false);
    });

    it('should see that the previously generated "unsupported card" error will cause a handleOnAllValid call to be ignored', async () => {
        let result;
        await act(() => {
            result = sfp.handleOnAllValid({ allValid: true });
        });
        expect(result).toBe(false);
        expect(sfp.state.isSfpValid).toBe(false);
    });

    it('should clear the previously generated "unsupported card" error & then a handleOnFieldValid call is handled correctly', async () => {
        unsupportedCardErrObj.error = null;

        // Clear the error by mocking a drop in the number of digits in the PAN to below a /binLookup threshold
        // sfp.processBinLookupResponse(null, true);

        // Clear the error by mocking a successful /binLookup response
        await act(() => {
            sfp.processBinLookupResponse(mockBinLookupObj);
        });

        expect(sfp.state.detectedUnsupportedBrands).toBe(null);

        let result;
        await act(() => {
            result = sfp.handleOnFieldValid({ fieldType: 'encryptedCardNumber', encryptedFieldName: 'encryptedCardNumber', valid: true });
        });
        expect(result).toBe(true);

        expect(sfp.state.valid.encryptedCardNumber).toBe(true);
    });

    it('should see that because we have cleared the "unsupported card" error that a handleOnAllValid call is handled correctly', async () => {
        let result;
        await act(() => {
            result = sfp.handleOnAllValid({ allValid: true });
        });
        expect(result).toBe(true);

        expect(sfp.state.isSfpValid).toBe(true);
    });
});

describe('<SecuredFieldsProvider /> handling an binLookup response', () => {
    it(
        'should receive a populated binLookup object and set the issuingCountryCode' +
            'then receive a "reset" object and reset the issuingCountryCode',
        async () => {
            nodeHolder.innerHTML = mockNode;
            brandsFromBinLookup.mockClear();
            renderSFP();

            sfp.csf = mockCSF;

            await act(() => {
                sfp.processBinLookupResponse(mockBinLookupObj);
            });

            expect(sfp.issuingCountryCode).toEqual('us');
            expect(brandsFromBinLookup).toHaveBeenCalledTimes(1);

            // reset
            await act(() => {
                sfp.processBinLookupResponse(null);
            });

            expect(sfp.issuingCountryCode).toBe(undefined);
            expect(brandsFromBinLookup).toHaveBeenCalledTimes(2);
        }
    );
});

/**
 * handleOnBrand - forcing local brand in countries requiring dual-brand selection mechanism
 */
describe('<SecuredFieldsProvider /> handleOnBrand with dual-brand selection mechanism', () => {
    const createBrandData = (brand: string, mode: string) => ({
        type: 'card',
        rootNode: nodeHolder,
        brand,
        cvcPolicy: 'required',
        expiryDatePolicy: 'required',
        cvcText: 'Security code',
        mode
    });

    beforeEach(() => {
        nodeHolder.innerHTML = mockNode;
    });

    it('should force cartebancaire brand when countryCode is FR and brand derived from best-guess', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'fr',
            brands: ['visa', 'mc', 'cartebancaire'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'cartebancaire'
            })
        );
    });

    it('should force bcmc brand when countryCode is BE and brand derived from best-guess', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'be',
            brands: ['visa', 'mc', 'bcmc'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('maestro', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'bcmc'
            })
        );
    });

    it('should force dankort brand when countryCode is DK and brand derived from best-guess', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'dk',
            brands: ['visa', 'mc', 'dankort'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'dankort'
            })
        );
    });

    it('should NOT force local brand when brand derived from bin-lookup', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'fr',
            brands: ['visa', 'mc', 'cartebancaire'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'bin-lookup'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'visa'
            })
        );
    });

    it('should NOT force local brand when local brand is not configured by merchant', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'fr',
            brands: ['visa', 'mc'], // cartebancaire not included
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'visa'
            })
        );
    });

    it('should NOT force local brand when countryCode is not in dual-brand selection map', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'us',
            brands: ['visa', 'mc'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'visa'
            })
        );
    });

    it('should NOT force local brand when brand is resetting (brand = "card")', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'fr',
            brands: ['visa', 'mc', 'cartebancaire'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('card', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'card'
            })
        );
    });

    it('should handle uppercase countryCode', async () => {
        const onBrand = jest.fn();
        renderSFP({
            countryCode: 'FR',
            brands: ['visa', 'mc', 'cartebancaire'],
            brandsConfiguration: {},
            resources: setupResourceMock(),
            onBrand
        });
        sfp.csf = mockCSF;

        await act(() => {
            sfp.handleOnBrand(createBrandData('visa', 'best-guess'));
        });

        expect(onBrand).toHaveBeenCalledWith(
            expect.objectContaining({
                brand: 'cartebancaire'
            })
        );
    });
});
