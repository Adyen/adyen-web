import OpenInvoiceContainer from './OpenInvoiceContainer';

describe('OpenInvoiceContainer', () => {
    const getWrapper = (props?) => new OpenInvoiceContainer({ ...props });

    test('should use the passed countryCode in the address fieldsets', () => {
        const countryCode = 'NL';
        const wrapper = getWrapper({ countryCode });
        expect(wrapper.props?.data?.billingAddress?.country).toBe(countryCode);
    });

    test('should not use return a fieldset which is not visible', () => {
        const visibility = { deliveryAddress: 'hidden' };
        const wrapper = getWrapper({ visibility });
        expect(wrapper.data?.billingAddress).toBe(undefined);
    });
});
