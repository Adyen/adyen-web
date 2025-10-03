import { h } from 'preact';
import PaypalButtons from './PaypalButtons';
import { render } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { mock } from 'jest-mock-extended';
import { PayPalButtonsProps } from './types';

const paypalIsEligibleMock = jest.fn(() => true);
const paypalRenderMock = jest.fn((el: HTMLElement) => Promise.resolve(el));

const paypalRefMock = {
    FUNDING: {
        PAYPAL: 'paypal',
        CREDIT: 'credit',
        PAYLATER: 'paylater',
        VENMO: 'venmo'
    },
    Buttons: jest.fn(() => ({ isEligible: paypalIsEligibleMock, render: paypalRenderMock }))
};

/**
 * Each of the elements we render the paypal buttons to have two classnames
 * e.g adyen-checkout__paypal__button adyen-checkout__paypal__button--venmo
 *
 * This function accepts the call invocations to the button.render function and does the following,
 * - Picks the second classname
 * - Returns the part of classname which is meant to be the name of the button
 * The example classnames above returns `venmo`
 * @param calls
 */
const getRenderedButtons = (calls: [e: HTMLElement][]) => {
    return calls.map(callArgs => callArgs[0].classList[1]?.split('--')[1]).filter(Boolean);
};

const renderWithCoreProvider = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('PaypalButtons', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call paypalRef.Buttons for each funding source', () => {
        jest.clearAllMocks();
        const buttonPropsMock = mock<PayPalButtonsProps>({
            paypalRef: paypalRefMock
        });
        renderWithCoreProvider(<PaypalButtons {...buttonPropsMock} />);
        expect(paypalRefMock.Buttons).toHaveBeenCalledTimes(4);
    });

    test('should call paypalRef.Buttons().render for each funding source', () => {
        jest.clearAllMocks();
        const buttonPropsMock = mock<PayPalButtonsProps>({
            paypalRef: paypalRefMock
        });
        renderWithCoreProvider(<PaypalButtons {...buttonPropsMock} />);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const renderedButtons = getRenderedButtons(paypalRenderMock.mock.calls);
        expect(renderedButtons).toEqual(['paypal', 'credit', 'pay-later', 'venmo']);
    });

    test('should not call paypalRef.Buttons().render for blocked paypal credit button', () => {
        jest.clearAllMocks();
        const buttonPropsMock = mock<PayPalButtonsProps>({
            paypalRef: paypalRefMock
        });
        renderWithCoreProvider(<PaypalButtons {...buttonPropsMock} blockPayPalCreditButton />);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const renderedButtons = getRenderedButtons(paypalRenderMock.mock.calls);
        expect(renderedButtons).toEqual(['paypal', 'pay-later', 'venmo']);
    });

    test('should not call paypalRef.Buttons().render for blocked paypal pay later button', () => {
        jest.clearAllMocks();
        const buttonPropsMock = mock<PayPalButtonsProps>({
            paypalRef: paypalRefMock
        });
        renderWithCoreProvider(<PaypalButtons {...buttonPropsMock} blockPayPalPayLaterButton />);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const renderedButtons = getRenderedButtons(paypalRenderMock.mock.calls);
        expect(renderedButtons).toEqual(['paypal', 'credit', 'venmo']);
    });

    test('should not call paypalRef.Buttons().render for blocked paypal venmo button', () => {
        jest.clearAllMocks();
        const buttonPropsMock = mock<PayPalButtonsProps>({
            paypalRef: paypalRefMock
        });
        renderWithCoreProvider(<PaypalButtons {...buttonPropsMock} blockPayPalVenmoButton />);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const renderedButtons = getRenderedButtons(paypalRenderMock.mock.calls);
        expect(renderedButtons).toEqual(['paypal', 'credit', 'pay-later']);
    });

    test('should pass onShippingAddressChange and onShippingOptionsChange callbacks to PayPal button', () => {
        const onShippingOptionsChange = jest.fn();
        const onShippingAddressChange = jest.fn();
        const onApprove = jest.fn();
        const createOrder = jest.fn();
        const onClick = jest.fn();
        const onError = jest.fn();
        const onInit = jest.fn();
        const onChange = jest.fn();
        const onCancel = jest.fn();
        const style = {};

        renderWithCoreProvider(
            <PaypalButtons
                configuration={{ intent: 'authorize', merchantId: 'xxxx' }}
                paypalRef={paypalRefMock}
                isProcessingPayment={false}
                onApprove={onApprove}
                onShippingAddressChange={onShippingAddressChange}
                onShippingOptionsChange={onShippingOptionsChange}
                onSubmit={createOrder}
                onClick={onClick}
                onError={onError}
                onInit={onInit}
                onChange={onChange}
                onCancel={onCancel}
                blockPayPalCreditButton
                blockPayPalPayLaterButton
                blockPayPalVenmoButton
            />
        );

        expect(paypalRenderMock).toHaveBeenCalledTimes(1);
        expect(paypalRefMock.Buttons).toHaveBeenCalledWith({
            onShippingAddressChange,
            onShippingOptionsChange,
            onApprove,
            createOrder,
            onClick,
            onCancel,
            onError,
            onInit,
            style,
            fundingSource: 'paypal'
        });
    });
});
