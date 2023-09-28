import { h } from 'preact';
import DragonpayVoucherResult from './DragonpayVoucherResult';
import { shallow } from 'enzyme';

describe('DragonpayVoucherResult', () => {
    test('should not render issuer image for dragonpay_otc_philippines', () => {
        const wrapper = shallow(<DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_philippines" />);
        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty('issuerImageUrl', null);
    });

    test('should render issuer image for dragonpay_otc_non_banking', () => {
        const wrapper = shallow(<DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_non_banking" />);
        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty(
            'issuerImageUrl',
            'https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/dragonpay_otc_non_banking/bpxb.svg'
        );
    });
});
