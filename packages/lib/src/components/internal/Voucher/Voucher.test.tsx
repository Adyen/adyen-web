import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import Voucher from './Voucher';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { VoucherProps } from './types';

const onActionHandled = jest.fn();

const baseProps: Omit<VoucherProps, 'paymentMethodType'> = {
    introduction: 'Introduction Text',
    amount: '€100.00',
    instructionsUrl: 'https://www.adyen.com',
    reference: '123456',
    onActionHandled
};

const renderVoucher = (props: Partial<VoucherProps> = {}) => {
    const mergedProps: VoucherProps = {
        paymentMethodType: 'pix',
        ...baseProps,
        ...props
    };

    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <Voucher {...mergedProps} />
        </CoreProvider>
    );
};

describe('Voucher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render all the basic voucher information', () => {
        renderVoucher();

        expect(screen.getByText('Introduction Text')).toBeInTheDocument();
        expect(screen.getByText('€100.00')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument();

        const instructionsLink = screen.getByRole('link', { name: /instructions/i });
        expect(instructionsLink).toBeInTheDocument();
        expect(instructionsLink).toHaveAttribute('href', baseProps.instructionsUrl);
    });

    test('should call onActionHandled when the component is mounted', () => {
        renderVoucher();

        expect(onActionHandled).toHaveBeenCalledTimes(1);
        expect(onActionHandled).toHaveBeenCalledWith({
            componentType: 'pix',
            actionDescription: 'voucher-presented'
        });
    });

    test('should render additional voucher details when provided', () => {
        const voucherDetails = [
            { label: 'Item 1', value: 'Value 1' },
            { label: 'Item 2', value: 'Value 2' }
        ];
        renderVoucher({ voucherDetails });

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Value 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Value 2')).toBeInTheDocument();
    });

    test('should render the payment method image when "issuerImageUrl" is provided', () => {
        const issuerImageUrl = 'https://example.com/image.png';
        renderVoucher({ issuerImageUrl, paymentMethodType: 'Pix' });

        const issuerImage = screen.getByRole('img', { name: 'Pix' });
        expect(issuerImage).toBeInTheDocument();
        expect(issuerImage).toHaveAttribute('src', issuerImageUrl);
    });

    test('should not render an payment method image if "issuerImageUrl" is not provided', () => {
        renderVoucher({ issuerImageUrl: null });

        // queryByRole returns null if the element is not found, which is what we want
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});
