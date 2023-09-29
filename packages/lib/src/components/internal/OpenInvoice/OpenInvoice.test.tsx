import { h } from 'preact';
import { mount } from 'enzyme';
import OpenInvoice from './OpenInvoice';
import { mock } from 'jest-mock-extended';
import { OpenInvoiceProps } from './types';
import { FieldsetVisibility } from '../../../types';
import CoreProvider from '../../../core/Context/CoreProvider';

let componentRef;
const setComponentRef = ref => {
    componentRef = ref;
};

const defaultProps = {
    onChange: () => {},
    data: { personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
    visibility: {
        personalDetails: 'editable' as FieldsetVisibility,
        billingAddress: 'editable' as FieldsetVisibility,
        deliveryAddress: 'editable' as FieldsetVisibility
    },
    setComponentRef: setComponentRef
};

const openInvoicePropsMock = mock<OpenInvoiceProps>();
const getWrapper = (props = {}) =>
    mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <OpenInvoice {...openInvoicePropsMock} {...defaultProps} {...props} />
        </CoreProvider>
    );

describe('OpenInvoice', () => {
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
        wrapper.update();
        expect(wrapper.find('Address')).toHaveLength(2);
        wrapper.find('Checkbox').prop('onChange')();
        wrapper.update();
        expect(wrapper.find('Address')).toHaveLength(1);
    });

    test('should render a consent checkbox if a consentCheckboxLabel is passed as a prop', () => {
        const wrapper = getWrapper({ consentCheckboxLabel: 'TEST' });
        expect(wrapper.find('ConsentCheckbox')).toHaveLength(1);
    });

    test('should call the onChange', () => {
        const onChange = jest.fn();
        getWrapper({ onChange });
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.any(Object),
                errors: expect.any(Object),
                isValid: expect.any(Boolean)
            })
        );
    });

    test('should be possible to change the status', () => {
        const payButton = jest.fn();
        const wrapper = getWrapper({ showPayButton: true, payButton });
        const status = 'loading';
        componentRef.setStatus(status);
        wrapper.update();
        expect(payButton).toHaveBeenCalledWith(expect.objectContaining({ status }));
    });

    test('should show FormInstruction', () => {
        const wrapper = getWrapper({ showFormInstruction: true });
        expect(wrapper.find('FormInstruction')).toHaveLength(1);
    });
});
