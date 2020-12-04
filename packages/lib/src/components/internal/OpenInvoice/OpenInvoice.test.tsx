import { h } from 'preact';
import { shallow } from 'enzyme';
import OpenInvoice from './OpenInvoice';

const defaultProps = {
    onChange: () => {},
    data: { personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
    visibility: {
        personalDetails: 'editable',
        billingAddress: 'editable',
        deliveryAddress: 'editable'
    }
};

describe('OpenInvoice', () => {
    const getWrapper = (props?) => shallow(<OpenInvoice {...defaultProps} {...props} />);

    test('should not display fieldsets set to hidden', () => {
        const visibility = { personalDetails: 'hidden' };
        const wrapper = getWrapper({ visibility });
        expect(wrapper.find('PersonalDetails')).toHaveLength(0);
    });

    test('should hide the delivery address by default', () => {
        const wrapper = getWrapper();
        expect(wrapper.find('Address')).toHaveLength(1);
    });

    test('should show the separate delivery checkbox by default', () => {
        const wrapper = getWrapper();
        expect(wrapper.find('Checkbox')).toHaveLength(1);
    });

    test('should not show the separate delivery checkbox if the delivery address is set to hidden', () => {
        const visibility = { deliveryAddress: 'hidden' };
        const wrapper = getWrapper({ visibility });
        expect(wrapper.find('Checkbox')).toHaveLength(0);
    });

    test('should not show the separate delivery checkbox if the billing address is set to hidden', () => {
        const visibility = { billingAddress: 'hidden' };
        const wrapper = getWrapper({ visibility });
        expect(wrapper.find('Checkbox')).toHaveLength(0);
    });

    test('clicking the separate delivery checkbox should toggle the delivery address fieldset', () => {
        const wrapper = getWrapper();
        wrapper.find('Checkbox').prop('onChange')();
        expect(wrapper.find('Address')).toHaveLength(2);
        wrapper.find('Checkbox').prop('onChange')();
        expect(wrapper.find('Address')).toHaveLength(1);
    });

    test('should render a consent checkbox if a consentCheckboxLabel is passed as a prop', () => {
        const wrapper = getWrapper({ consentCheckboxLabel: 'TEST' });
        expect(wrapper.find('ConsentCheckbox')).toHaveLength(1);
    });

    test('should call the onChange', () => {
        const onChange = jest.fn();
        getWrapper({ onChange });
        expect(onChange.mock.calls.length).toBe(1);
    });

    test('should be possible to change the status', () => {
        const payButton = jest.fn();
        const wrapper = getWrapper({ showPayButton: true, payButton });
        const status = 'loading';
        wrapper.instance().setStatus(status);
        wrapper.update();
        expect(payButton).toHaveBeenCalledWith(jasmine.objectContaining({ status }));
    });
});
