import { mount } from 'enzyme';
import { h } from 'preact';
import Voucher from './Voucher';
import CoreProvider from '../../../core/Context/CoreProvider';

const outputDetails = {
    paymentMethodType: 'type',
    introduction: 'Introduction Text',
    amount: '100',
    instructionsUrl: 'http://...',
    reference: '123456'
};

describe('Voucher', () => {
    test('Render a Voucher', () => {
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Voucher {...outputDetails} />
            </CoreProvider>
        );
        expect(wrapper.find('.adyen-checkout__voucher-result__introduction').text()).toContain('Introduction Text');
        expect(wrapper.find('.adyen-checkout__voucher-result__amount').text()).toBe('100');
        expect(wrapper.find('.adyen-checkout-link--voucher-result-instructions').length).toBe(1);
        expect(wrapper.find('.adyen-checkout__voucher-result__code > span').text()).toBe('123456');
    });

    test('Render VoucherDetails', () => {
        const voucherDetails = [
            { label: 'item 1', value: '1' },
            { label: 'item 2', value: '2' }
        ];
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Voucher {...outputDetails} voucherDetails={voucherDetails} />
            </CoreProvider>
        );
        expect(wrapper.find('.adyen-checkout__voucher-result__amount').text()).toBe('100');
        expect(wrapper.find('.adyen-checkout-link--voucher-result-instructions').length).toBe(1);
        expect(wrapper.find('.adyen-checkout__voucher-result__code > span').text()).toBe('123456');
    });

    test('should not render issuer image if issuerImageUrl prop is not provided', () => {
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Voucher {...outputDetails} issuerImageUrl={null} />
            </CoreProvider>
        );
        expect(wrapper.find('.adyen-checkout__voucher-result__image__issuer').exists()).toBeFalsy();
    });
});
