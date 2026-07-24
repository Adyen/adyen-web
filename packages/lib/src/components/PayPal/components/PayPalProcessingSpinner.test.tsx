import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

const renderWithCoreProvider = (ui: h.JSX.Element) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('PayPalProcessingSpinner', () => {
    test('should render the spinner inside the processing status container', () => {
        renderWithCoreProvider(<PayPalProcessingSpinner withReviewPage={false} />);

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('should show the processing payment message when there is no review page', () => {
        renderWithCoreProvider(<PayPalProcessingSpinner withReviewPage={true} />);

        expect(screen.getByText(core.modules.i18n.get('paypal.processingPayment'))).toBeInTheDocument();
    });

    test('should not show the processing payment message when there is a review page', () => {
        renderWithCoreProvider(<PayPalProcessingSpinner withReviewPage={false} />);

        expect(screen.queryByText(core.modules.i18n.get('paypal.processingPayment'))).not.toBeInTheDocument();
    });
});
