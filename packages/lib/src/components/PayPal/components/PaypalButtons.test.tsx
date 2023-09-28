import { h } from 'preact';
import PaypalButtons from './PaypalButtons';
import { render } from '@testing-library/preact';
import CoreProvider from '../../../core/Context/CoreProvider';

const isEligible = jest.fn(() => true);
const renderMock = jest.fn(() => Promise.resolve());

const paypalRefMock = {
    FUNDING: {
        PAYPAL: 'paypal',
        CREDIT: 'credit',
        PAYLATER: 'paylater'
    },
    Buttons: jest.fn(() => ({ isEligible, render: renderMock }))
};

const renderWithCoreProvider = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('PaypalButtons', () => {
    test('Calls to paypalRef.Buttons', async () => {
        jest.clearAllMocks();
        renderWithCoreProvider(<PaypalButtons isProcessingPayment={false} onApprove={jest.fn()} paypalRef={paypalRefMock} />);
        expect(paypalRefMock.Buttons).toHaveBeenCalledTimes(4);
    });

    test('Calls to paypalRef.Buttons().render', async () => {
        jest.clearAllMocks();
        renderWithCoreProvider(<PaypalButtons isProcessingPayment={false} onApprove={jest.fn()} paypalRef={paypalRefMock} />);
        expect(paypalRefMock.Buttons().render).toHaveBeenCalledTimes(4);
    });
});
