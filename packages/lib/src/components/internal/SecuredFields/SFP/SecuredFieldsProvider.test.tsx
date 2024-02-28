import { shallow } from 'enzyme';
import { h } from 'preact';
import SecuredFieldsProvider from './SecuredFieldsProvider';
import Language from '../../../../language/Language';
import { ErrorCodes } from '../../../../core/Errors/constants';

jest.mock('../lib/CSF', () => {
    return () => true;
});

const i18n = new Language('en-US', {});

let wrapper;
let sfp;

const onError = jest.fn(() => {});
const renderFn = jest.fn(() => {});

const handleSecuredFieldsRef = ref => {
    sfp = ref;
};

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
    error: ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED,
    detectedBrands: ['cartebancaire']
};

const regularErrObj = {
    error: ErrorCodes.ERROR_MSG_INCOMPLETE_FIELD,
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

wrapper = shallow(
    <SecuredFieldsProvider
        ref={handleSecuredFieldsRef}
        rootNode={nodeHolder}
        styles={styles}
        render={renderFn}
        onError={onError}
        i18n={i18n}
        configuration={{}}
    />
);

/**
 * Rendering
 */
describe('<SecuredFieldsProvider /> rendering', () => {
    test('Loading state', () => {
        expect(wrapper.instance().state.status).toBe('loading');
        wrapper.instance().handleOnConfigSuccess();
        expect(wrapper.instance().state.status).toBe('ready');
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

    it('should create an error object for each visible secured field, pass the object to the props.onError fn & set state.errors', () => {
        sfp.showValidation();

        expect(sfp.state.errors.encryptedCardNumber).not.toBe(false);
        expect(sfp.state.errors.encryptedExpiryDate).not.toBe(false);
        expect(sfp.state.errors.encryptedSecurityCode).not.toBe(false);
    });

    it('should call the passed render function', () => {
        expect(renderFn).toHaveBeenCalled();
    });

    it('should register the presence of a date field element within the passed rootNode', () => {
        expect(wrapper.instance().numDateFields).toBe(1);
    });

    it('should register the presence of 2 date field elements within the passed rootNode', () => {
        nodeHolder.innerHTML = mockNodeTwoDateFields;

        wrapper = shallow(
            <SecuredFieldsProvider ref={handleSecuredFieldsRef} rootNode={nodeHolder} render={() => null} onError={onError} configuration={{}} />
        );
        expect(wrapper.instance().numDateFields).toBe(2);
    });
});

/**
 * Unsupported cards (including related errors)
 */
describe('<SecuredFieldsProvider /> handling an unsupported card', () => {
    it('should generate an "unsupported card" error that propagates to the onError callback', () => {
        nodeHolder.innerHTML = mockNode;
        wrapper = shallow(
            <SecuredFieldsProvider
                ref={handleSecuredFieldsRef}
                rootNode={nodeHolder}
                styles={styles}
                render={renderFn}
                onError={onError}
                i18n={i18n}
                configuration={{}}
            />
        );

        wrapper.instance().csf = mockCSF;

        expect(wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj)).toBe(true);
    });

    it('should see that the "unsupported card" error has set state on the SecuredFieldsProvider', () => {
        expect(wrapper.instance().state.detectedUnsupportedBrands.length).toEqual(1);
        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED);
    });

    it('should clear the previously generated "unsupported card" error & propagate to the onError callback', () => {
        unsupportedCardErrObj.error = null;

        expect(wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj)).toBe(false);
    });

    it('should see that the cleared "unsupported card" error has reset state on the SecuredFieldsProvider', () => {
        expect(wrapper.instance().state.errors.encryptedCardNumber).toBe(false);
    });

    it('should clear the previously generated "unsupported card" error & then a regular error is handled correctly', () => {
        unsupportedCardErrObj.error = null;

        wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj);

        expect(wrapper.instance().handleOnError(regularErrObj)).toBe(true);

        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(ErrorCodes.ERROR_MSG_INCOMPLETE_FIELD);
    });

    it('should re-generate an "unsupported card" error and then a handleOnFieldValid call should be ignored', () => {
        // @ts-ignore - it's a test!
        unsupportedCardErrObj.error = 'Unsupported card';
        unsupportedCardErrObj.detectedBrands = ['cartebancaire'];

        wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj);
        expect(wrapper.instance().state.detectedUnsupportedBrands.length).toEqual(1);

        expect(wrapper.instance().handleOnFieldValid({ fieldType: 'encryptedCardNumber' })).toBe(false);
        expect(wrapper.instance().state.valid.encryptedCardNumber).toBe(false);
    });

    it('should see that the previously generated "unsupported card" error will cause a handleOnAllValid call to be ignored', () => {
        expect(wrapper.instance().handleOnAllValid({ allValid: true })).toBe(false);
        expect(wrapper.instance().state.isSfpValid).toBe(false);
    });

    it('should clear the previously generated "unsupported card" error & then a handleOnFieldValid call is handled correctly', () => {
        unsupportedCardErrObj.error = null;

        // Clear the error by mocking a drop in the number of digits in the PAN to below a /binLookup threshold
        // wrapper.instance().processBinLookupResponse(null, true);

        // Clear the error by mocking a successful /binLookup response
        wrapper.instance().processBinLookupResponse(mockBinLookupObj);

        expect(wrapper.instance().state.detectedUnsupportedBrands).toBe(null);

        expect(
            wrapper.instance().handleOnFieldValid({ fieldType: 'encryptedCardNumber', encryptedFieldName: 'encryptedCardNumber', valid: true })
        ).toBe(true);

        expect(wrapper.instance().state.valid.encryptedCardNumber).toBe(true);
    });

    it('should see that because we have cleared the "unsupported card" error that a handleOnAllValid call is handled correctly', () => {
        expect(wrapper.instance().handleOnAllValid({ allValid: true })).toBe(true);

        expect(wrapper.instance().state.isSfpValid).toBe(true);
    });
});

describe('<SecuredFieldsProvider /> handling an binLookup response', () => {
    it(
        'should receive a populated binLookup object and set the issuingCountryCode' +
            'then receive a "reset" object and reset the issuingCountryCode',
        () => {
            nodeHolder.innerHTML = mockNode;
            wrapper = shallow(
                <SecuredFieldsProvider
                    ref={handleSecuredFieldsRef}
                    rootNode={nodeHolder}
                    styles={styles}
                    render={renderFn}
                    onError={onError}
                    i18n={i18n}
                    configuration={{}}
                />
            );

            const sfp = wrapper.instance();

            sfp.csf = mockCSF;

            sfp.processBinLookupResponse(mockBinLookupObj);

            expect(sfp.issuingCountryCode).toEqual('us');
            expect(brandsFromBinLookup).toHaveBeenCalledTimes(2);

            // reset
            sfp.processBinLookupResponse(null);

            expect(sfp.issuingCountryCode).toBe(undefined);
            expect(brandsFromBinLookup).toHaveBeenCalledTimes(3);
        }
    );
});
