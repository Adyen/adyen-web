import { h } from 'preact';
import PaypalButtons from './PaypalButtons';
import { render } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { mock } from 'jest-mock-extended';
import { PayPalButtonsProps } from './types';

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
        expect(paypalRefMock.Buttons().render).toHaveBeenCalledTimes(4);
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
