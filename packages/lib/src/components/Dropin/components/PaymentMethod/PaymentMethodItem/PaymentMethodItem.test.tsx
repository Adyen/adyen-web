import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { h } from 'preact';
import PaymentMethodItem from './PaymentMethodItem';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import UIElement from '../../../../internal/UIElement';

import type { PaymentMethodItemProps } from './PaymentMethodItem';

const paymentMethod = mock<UIElement>({
    _id: '123456',
    displayName: 'iDeal',
    showDropinHeaderWhenSelected: true,
    props: {
        type: 'ideal'
    },
    render: jest.fn()
});

const requiredProps: PaymentMethodItemProps = {
    paymentMethod,
    isDisablingPaymentMethod: false,
    showRemovePaymentMethodButton: false,
    onDisableStoredPaymentMethod: jest.fn(),
    onSelect: jest.fn(),
    standalone: true
};

describe('PaymentMethodItem', () => {
    const user = userEvent.setup();

    const customRender = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                {ui}
            </CoreProvider>
        );
    };
    test('should render a pay PaymentMethodItem', () => {
        const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} />);

        /* eslint-disable testing-library/no-container */
        /* eslint-disable testing-library/no-node-access */
        expect(container.getElementsByClassName('123456').length).toBe(1);
        expect(container.getElementsByClassName('adyen-checkout__payment-method').length).toBe(1);
        expect(container.getElementsByClassName('adyen-checkout__payment-method--ideal').length).toBe(1);
        /* eslint-enable testing-library/no-container */
        /* eslint-enable testing-library/no-node-access */
    });

    test('should trigger onSelect if clicked', async () => {
        const onSelect = jest.fn();
        customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} onSelect={onSelect} />);

        await user.click(screen.getByText('iDeal'));

        expect(onSelect.mock.calls.length).toBe(1);
    });

    test('should not trigger onSelect when focusing', () => {
        const onSelect = jest.fn();
        customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} onSelect={onSelect} />);

        const element = screen.getByText('iDeal');
        element.focus();

        expect(onSelect.mock.calls.length).toBe(0);
    });

    test('should not have inert attribute on details when payment method is selected', () => {
        const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} isSelected={true} />);

        /* eslint-disable testing-library/no-container, testing-library/no-node-access */
        const detailsElement = container.querySelector('.adyen-checkout__payment-method__details');
        expect(detailsElement).not.toHaveAttribute('inert');
        /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    });

    test('should have inert attribute on details when payment method is not selected', () => {
        const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} isSelected={false} />);

        /* eslint-disable testing-library/no-container, testing-library/no-node-access */
        const detailsElement = container.querySelector('.adyen-checkout__payment-method__details');
        expect(detailsElement).toHaveAttribute('inert');
        /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    });

    describe('showDropinHeaderWhenSelected', () => {
        const headerlessPaymentMethod = mock<UIElement>({
            _id: '654321',
            displayName: 'GooglePay',
            showDropinHeaderWhenSelected: false,
            props: {
                type: 'googlepay'
            },
            render: jest.fn()
        });

        /* eslint-disable testing-library/no-container, testing-library/no-node-access */
        test('should render the header and no headerless modifier by default when selected', () => {
            const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} isSelected={true} />);

            expect(container.querySelector('.adyen-checkout__payment-method__header')).toBeInTheDocument();
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(0);
        });

        test('should hide the header and add the headerless modifier when opted-in and selected', () => {
            const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={headerlessPaymentMethod} isSelected={true} />);

            expect(container.querySelector('.adyen-checkout__payment-method__header')).not.toBeInTheDocument();
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(1);
        });

        test('should keep the header when opted-in but not selected', () => {
            const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={headerlessPaymentMethod} isSelected={false} />);

            expect(container.querySelector('.adyen-checkout__payment-method__header')).toBeInTheDocument();
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(0);
        });
        /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    });
});
