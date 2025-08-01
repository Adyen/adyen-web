import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import DragonpayVoucherResult from './DragonpayVoucherResult';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { DragonpayVoucherResultProps } from '../../types';

const renderDragonpayVoucher = (props: DragonpayVoucherResultProps) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <DragonpayVoucherResult {...props} />
        </CoreProvider>
    );
};

describe('DragonpayVoucherResult', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should not render an issuer image for dragonpay_otc_philippines', () => {
        renderDragonpayVoucher({
            issuer: 'BPXB',
            paymentMethodType: 'dragonpay_otc_philippines'
        });
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('should render an issuer image for dragonpay_otc_non_banking', () => {
        const imageUrl = 'https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/dragonpay_otc_non_banking/bpxb.svg';

        global.resources.getImage.mockImplementation(() => () => imageUrl);

        renderDragonpayVoucher({
            issuer: 'BPXB',
            paymentMethodType: 'dragonpay_otc_non_banking'
        });

        const issuerImage = screen.getByRole('img', { name: /dragonpay_otc_non_banking/i });
        expect(issuerImage).toBeInTheDocument();
        expect(issuerImage).toHaveAttribute('src', imageUrl);
    });
});
