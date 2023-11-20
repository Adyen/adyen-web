import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PaymentMethodBrands from './PaymentMethodBrands';

describe('PaymentMethodBrands', () => {
    test('should not render anything if payment method is selected', () => {
        const brands = [{ name: 'visa', icon: 'visa.png' }];
        const { container } = render(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={true} />);

        expect(container).toBeEmptyDOMElement();
    });

    test('should render three brands', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];

        render(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} />);

        screen.getByAltText('VISA');
        screen.getByAltText('MasterCard');
        screen.getByAltText('American Express');

        expect(screen.queryByText(/\+/)).toBeNull();
    });

    test('should render three brands AND number of left over brands', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' },
            { name: 'discovery', icon: 'discovery.png' },
            { name: 'vpay', icon: 'vpay.png' },
            { name: 'maestro', icon: 'maestro.png' }
        ];

        render(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} />);

        screen.getByAltText('VISA');
        screen.getByAltText('MasterCard');
        screen.getByAltText('American Express');

        screen.getByText('+3');
    });
});
