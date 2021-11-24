import { h } from 'preact';
import { shallow } from 'enzyme';
import DragonpayVoucherResult from './DragonpayVoucherResult';
import Voucher from '../../../internal/Voucher';

describe('DragonpayVoucherResult', () => {
    test('should not render issuer image for dragonpay_otc_philippines', () => {
        const wrapper = shallow(<DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_philippines" />);
        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty('issuerImageUrl', null);
    });

    test('should render issuer image for dragonpay_otc_non_banking', () => {
        const wrapper = shallow(<DragonpayVoucherResult issuer="BPXB" paymentMethodType="dragonpay_otc_non_banking" />);
        const voucher = wrapper.find('Voucher');
        expect(voucher.props()).toHaveProperty('issuerImageUrl', 'images/logos/dragonpay_otc_non_banking/bpxb.svg');
    });
});
