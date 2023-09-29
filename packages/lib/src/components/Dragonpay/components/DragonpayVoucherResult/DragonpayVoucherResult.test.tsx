import { h } from 'preact';
import DragonpayVoucherResult from './DragonpayVoucherResult';
import { mount } from 'enzyme';
import CoreProvider from '../../../../core/Context/CoreProvider';

describe('DragonpayVoucherResult', () => {
    test('should not render issuer image for dragonpay_otc_philippines', () => {
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_philippines" />
            </CoreProvider>
        );

        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty('issuerImageUrl', null);
    });

    test('should render issuer image for dragonpay_otc_non_banking', () => {
        global.resources.getImage.mockImplementation(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            props => props => 'https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/dragonpay_otc_non_banking/bpxb.svg'
        );

        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_non_banking" />
            </CoreProvider>
        );

        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty(
            'issuerImageUrl',
            'https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/dragonpay_otc_non_banking/bpxb.svg'
        );
    });
});
