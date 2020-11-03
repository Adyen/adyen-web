import { shallow } from 'enzyme';
import { h } from 'preact';
import SecuredFieldsProvider from './SecuredFieldsProvider';
import Language from '../../../language/Language';
import { ERROR_CODES, ERROR_MSG_INCOMPLETE_FIELD, ERROR_MSG_UNSUPPORTED_CARD_ENTERED, ERROR_MSG_CLEARED } from '../../../core/Errors/constants';
import { getError, getDefaultErrorCode } from '../../../core/Errors/utils';

jest.mock('./lib', () => {
    return () => true;
});

const i18n = new Language('en-US', {});

let wrapper;
let sfp;

let errorObj;

const onError = jest.fn(errObj => {
    errorObj = errObj;
});
const renderFn = jest.fn((props, state) => {});

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
    error: ERROR_CODES[ERROR_MSG_UNSUPPORTED_CARD_ENTERED],
    binLookupBrands: ['cartebancaire']
};

const regularErrObj = {
    error: ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD],
    fieldType: 'encryptedCardNumber',
    type: 'card'
};

const nodeHolder = document.createElement('div');
nodeHolder.innerHTML = mockNode;

const mockCSF = {
    hasUnsupportedCard: () => {}
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

        expect(onError).toHaveBeenCalledTimes(3);
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
        expect(onError).toHaveBeenCalledTimes(4);
        expect(errorObj.error).toEqual(ERROR_CODES[ERROR_MSG_UNSUPPORTED_CARD_ENTERED]);
    });

    it('should see that the "unsupported card" error has set state on the SecuredFieldsProvider', () => {
        expect(wrapper.instance().state.hasUnsupportedCard).toBe(true);
        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(ERROR_CODES[ERROR_MSG_UNSUPPORTED_CARD_ENTERED]);
    });

    it('should clear the previously generated "unsupported card" error & propagate to the onError callback', () => {
        unsupportedCardErrObj.error = '';
        expect(wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj)).toBe(false);
        expect(errorObj.error).toEqual('');
    });

    it('should see that the cleared "unsupported card" error has reset state on the SecuredFieldsProvider', () => {
        expect(wrapper.instance().state.hasUnsupportedCard).toBe(false);
        expect(wrapper.instance().state.errors.encryptedCardNumber).toBe(false);
    });

    it('should clear the previously generated "unsupported card" error & then a regular error is handled correctly', () => {
        unsupportedCardErrObj.error = '';
        wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj);

        expect(wrapper.instance().handleOnError(regularErrObj)).toBe(true);

        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD]);
    });

    it('should re-generate an "unsupported card" error and then a handleOnFieldValid call should be ignored', () => {
        unsupportedCardErrObj.error = 'Unsupported card';
        wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj);
        expect(wrapper.instance().state.hasUnsupportedCard).toBe(true);

        expect(wrapper.instance().handleOnFieldValid({ fieldType: 'encryptedCardNumber' })).toBe(false);
        expect(wrapper.instance().state.valid.encryptedCardNumber).toBe(false);
    });

    it('should see that the previously generated "unsupported card" error will cause a handleOnAllValid call to be ignored', () => {
        expect(wrapper.instance().handleOnAllValid({ allValid: true })).toBe(false);
        expect(wrapper.instance().state.isSfpValid).toBe(false);
    });

    it('should clear the previously generated "unsupported card" error & then a handleOnFieldValid call is handled correctly', () => {
        unsupportedCardErrObj.error = '';
        wrapper.instance().handleUnsupportedCard(unsupportedCardErrObj);

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

/**
 * Error handling
 */
describe('<SecuredFieldsProvider /> handling error codes', () => {
    it("should handle an error and set the appropriate 'errorText' and translated, 'errorI18n' props onto the error object", () => {
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

        wrapper.instance().handleOnError(regularErrObj);

        const errorCode = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];

        expect(errorObj.error).toEqual(errorCode);
        expect(errorObj.errorText).toEqual(getError(errorCode));
        expect(errorObj.errorI18n).toEqual(i18n.get(errorCode));
    });

    it("should handle an error with a code it doesn't recognise and set the relevant state and props based on a default code", () => {
        regularErrObj.error = 'some.strange.code';

        wrapper.instance().handleOnError(regularErrObj);

        expect(errorObj.error).toEqual('some.strange.code');

        const defaultErrorCode = getDefaultErrorCode(regularErrObj.fieldType);
        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(defaultErrorCode);

        expect(errorObj.errorText).toEqual(defaultErrorCode);
        expect(errorObj.errorI18n).toEqual(i18n.get(defaultErrorCode));
    });

    it('should clear the previous error', () => {
        regularErrObj.error = '';

        wrapper.instance().handleOnError(regularErrObj);

        expect(wrapper.instance().state.errors.encryptedCardNumber).toEqual(false);

        expect(errorObj.errorText).toEqual(ERROR_MSG_CLEARED);
        expect(errorObj.errorI18n).toEqual('');
    });
});
