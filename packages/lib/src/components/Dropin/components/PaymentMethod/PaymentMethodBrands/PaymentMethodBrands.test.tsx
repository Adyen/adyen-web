import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PaymentMethodBrands from './PaymentMethodBrands';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';

describe('PaymentMethodBrands', () => {
    const renderWrapper = children =>
        render(
            <CoreProvider i18n={global.i18n} loadingContext={global.loadingContext} resources={global.resources}>
                {children}
            </CoreProvider>
        );

    test('should not render anything if payment method is selected', () => {
        const brands = [{ name: 'visa', icon: 'visa.png' }];
        const { container } = renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={true} />);

        expect(container).toBeEmptyDOMElement();
    });

    test('should render three brands', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];

        renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} />);

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

        renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} />);

        screen.getByAltText('VISA');
        screen.getByAltText('MasterCard');
        screen.getByAltText('American Express');

        screen.getByText('+3');
    });

    test('should render 4 brands AND `other` keyword', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' },
            { name: 'maestro', icon: 'maestro.png' }
        ];

        renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} showOtherInsteafOfNumber={true} />);

        screen.getByAltText('VISA');
        screen.getByAltText('MasterCard');
        screen.getByAltText('American Express');
        screen.getByAltText('Maestro');

        screen.getByText('+ other');
    });

    test('hide brands when paymentMethod is selected', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' },
            { name: 'maestro', icon: 'maestro.png' }
        ];

        renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={true} />);

        expect(screen.queryByAltText('VISA')).toBeNull();
        expect(screen.queryByAltText('MasterCard')).toBeNull();
        expect(screen.queryByAltText('American Express')).toBeNull();
        expect(screen.queryByAltText('Maestro')).toBeNull();
    });

    test('show brands when paymentMethod is selected and keepBrandsVisible is true', () => {
        const brands = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' },
            { name: 'maestro', icon: 'maestro.png' }
        ];

        renderWrapper(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={true} keepBrandsVisible={true} />);

        expect(screen.getByAltText('VISA')).toBeDefined();
        expect(screen.getByAltText('MasterCard')).toBeDefined();
        expect(screen.getByAltText('American Express')).toBeDefined();
        expect(screen.getByAltText('Maestro')).toBeDefined();
    });
});
