import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import DragonpayInput from './DragonpayInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

declare global {
    var i18n: any;
    var resources: any;
}

const defaultProps = {
    data: {},
    items: [
        { id: 'BDO', name: 'BDO' },
        { id: 'BPIA', name: 'Bank of the Philippine Islands' }
    ],
    onChange: jest.fn(),
    showPayButton: false,
    payButton: jest.fn()
};

const renderDragonpayInput = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <DragonpayInput {...defaultProps} {...props} />
        </CoreProvider>
    );
};

describe('DragonpayInput', () => {
    describe('isIssuerRequired', () => {
        test('should render issuer select for dragonpay_ebanking', () => {
            renderDragonpayInput({ type: 'dragonpay_ebanking' });
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        test('should render issuer select for dragonpay_otc_banking', () => {
            renderDragonpayInput({ type: 'dragonpay_otc_banking' });
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        test('should render issuer select for dragonpay_otc_non_banking', () => {
            renderDragonpayInput({ type: 'dragonpay_otc_non_banking' });
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        test('should not render issuer select for dragonpay_otc_philippines', () => {
            renderDragonpayInput({ type: 'dragonpay_otc_philippines' });
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        test('should not render issuer select when type is not in the issuer-required list', () => {
            renderDragonpayInput({ type: 'dragonpay_other' });
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });
    });
});
