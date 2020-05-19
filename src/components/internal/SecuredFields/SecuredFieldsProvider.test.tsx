import { shallow } from 'enzyme';
import { h } from 'preact';
import CSF from './lib';
import SecuredFieldsProvider from './SecuredFieldsProvider';

jest.mock('./lib', () => {
    return () => true;
});

const i18n = { get: key => key };

let wrapper;
let sfp;

const onError = jest.fn(errorObj => {});
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

const nodeHolder = document.createElement('div');
nodeHolder.innerHTML = mockNode;

wrapper = shallow(<SecuredFieldsProvider ref={handleSecuredFieldsRef} rootNode={nodeHolder} styles={styles} render={renderFn} onError={onError} />);

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

        wrapper = shallow(<SecuredFieldsProvider ref={handleSecuredFieldsRef} rootNode={nodeHolder} render={() => null} />);
        expect(wrapper.instance().numDateFields).toBe(2);
    });
});
