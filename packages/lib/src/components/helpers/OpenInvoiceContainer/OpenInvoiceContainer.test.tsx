import OpenInvoiceContainer from './OpenInvoiceContainer';

describe('OpenInvoiceContainer', () => {
    const getWrapper = (props = {}) => new OpenInvoiceContainer({ ...props });

    test('should use the passed countryCode in the address fieldsets', () => {
        const countryCode = 'US';
        const wrapper = getWrapper({ countryCode });
        expect(wrapper.props?.data?.billingAddress?.country).toBe(countryCode);
    });

    test('should not use return a fieldset which is not visible', () => {
        const visibility = { deliveryAddress: 'hidden' };
        const wrapper = getWrapper({ visibility });
        expect(wrapper.props.visibility.personalDetails).toBe('editable');
        expect(wrapper.props.visibility.deliveryAddress).toBe('hidden');
    });

    test('should not return include the company details by default', () => {
        const wrapper = getWrapper({});
        expect(wrapper.props.visibility.companyDetails).toBe('hidden');
        expect(wrapper.props.visibility.personalDetails).toBe('editable');
    });
});
