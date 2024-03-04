import { h } from 'preact';
import { render } from '@testing-library/preact';
import PaypalButtons from './PaypalButtons';

const paypalIsEligibleMock = jest.fn(() => true);
const paypalRenderMock = jest.fn(() => Promise.resolve());

const paypalRefMock = {
    FUNDING: {
        PAYPAL: 'paypal',
        CREDIT: 'credit',
        PAYLATER: 'paylater'
    },
    Buttons: jest.fn(() => ({ isEligible: paypalIsEligibleMock, render: paypalRenderMock }))
};

const renderComponent = () => render(<PaypalButtons isProcessingPayment={false} onApprove={jest.fn()} paypalRef={paypalRefMock} />);

describe('PaypalButtons', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call paypalRef.Buttons for each funding source', async () => {
        renderComponent();
        expect(paypalRefMock.Buttons).toHaveBeenCalledTimes(4);
    });

    test('should call paypalRef.Buttons().render for each funding source', async () => {
        renderComponent();
        expect(paypalRenderMock).toHaveBeenCalledTimes(4);
    });

    test('should pass onShippingAddressChange and onShippingOptionsChange callbacks to PayPal button', () => {
        const onShippingOptionsChange = jest.fn();
        const onShippingAddressChange = jest.fn();
        const onApprove = jest.fn();
        const createOrder = jest.fn();
        const onClick = jest.fn();
        const onError = jest.fn();
        const onInit = jest.fn();
        const style = {};

        render(
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
            onError,
            onInit,
            style,
            fundingSource: 'paypal'
        });
    });
});
