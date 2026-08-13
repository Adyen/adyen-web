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

    describe('showRemovePaymentMethodButton', () => {
        const createStoredPaymentMethod = (type: string, oneClick = true) =>
            mock<UIElement>({
                _id: 'stored-1',
                displayName: 'Stored payment method',
                showDropinHeaderWhenSelected: true,
                props: {
                    type,
                    oneClick
                },
                render: jest.fn()
            });

        const getRemoveButton = () => screen.queryByRole('button', { name: global.i18n.get('storedPaymentMethod.disable.button') });
        /* eslint-disable-next-line testing-library/no-container, testing-library/no-node-access */
        const getDisableConfirmation = (container: Element) => container.querySelector('.adyen-checkout__payment-method__disable-confirmation');

        test('should render the remove button and the disable confirmation for a stored payment method', () => {
            const { container } = customRender(
                <PaymentMethodItem
                    {...requiredProps}
                    paymentMethod={createStoredPaymentMethod('scheme')}
                    showRemovePaymentMethodButton={true}
                    isSelected={true}
                />
            );

            expect(getRemoveButton()).toBeInTheDocument();
            expect(getDisableConfirmation(container)).toBeInTheDocument();
        });

        test.each(['googlepay', 'paywithgoogle'])('should not render the remove button for a stored %s payment method', type => {
            const { container } = customRender(
                <PaymentMethodItem
                    {...requiredProps}
                    paymentMethod={createStoredPaymentMethod(type)}
                    showRemovePaymentMethodButton={true}
                    isSelected={true}
                />
            );

            expect(getRemoveButton()).not.toBeInTheDocument();
            expect(getDisableConfirmation(container)).not.toBeInTheDocument();
        });

        test('should not render the remove button for a non stored googlepay payment method', () => {
            const { container } = customRender(
                <PaymentMethodItem
                    {...requiredProps}
                    paymentMethod={createStoredPaymentMethod('googlepay', false)}
                    showRemovePaymentMethodButton={true}
                    isSelected={true}
                />
            );

            expect(getRemoveButton()).not.toBeInTheDocument();
            expect(getDisableConfirmation(container)).not.toBeInTheDocument();
        });

        test('should not render the remove button for a stored googlepay payment method even when it is not selected', () => {
            customRender(
                <PaymentMethodItem
                    {...requiredProps}
                    paymentMethod={createStoredPaymentMethod('googlepay')}
                    showRemovePaymentMethodButton={true}
                    isSelected={false}
                />
            );

            expect(getRemoveButton()).not.toBeInTheDocument();
        });
    });

    describe('showDropinHeaderWhenSelected', () => {
        const headerlessPaymentMethod = mock<UIElement>({
            _id: '654321',
            displayName: 'GooglePay',
            additionalInfo: '',
            icon: 'googlepay.svg',
            showDropinHeaderWhenSelected: false,
            props: {
                type: 'googlepay',
                oneClick: false
            },
            render: jest.fn()
        });

        /* eslint-disable testing-library/no-container, testing-library/no-node-access */
        test('should render the header and no headerless modifier by default when selected', () => {
            const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={paymentMethod} isSelected={true} />);

            expect(container.querySelector('.adyen-checkout__payment-method__header')).toBeInTheDocument();
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(0);
        });

        test('should visually hide the header while retaining selected radio semantics when opted-in and selected', () => {
            const { container } = customRender(
                <PaymentMethodItem {...requiredProps} paymentMethod={headerlessPaymentMethod} isSelected={true} standalone={false} />
            );

            expect(container.querySelector('.adyen-checkout__payment-method__header')).toHaveClass(
                'adyen-checkout__payment-method__header--visually-hidden'
            );
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(1);
            expect(screen.getByRole('radio', { name: 'GooglePay' })).toHaveAttribute('aria-checked', 'true');
        });

        test('should keep the header when opted-in but not selected', () => {
            const { container } = customRender(<PaymentMethodItem {...requiredProps} paymentMethod={headerlessPaymentMethod} isSelected={false} />);

            expect(container.querySelector('.adyen-checkout__payment-method__header')).toBeInTheDocument();
            expect(container.getElementsByClassName('adyen-checkout__payment-method--headerless').length).toBe(0);
        });
        /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    });
});
