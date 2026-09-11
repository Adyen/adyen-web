import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import CVC from './CVC';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';

const renderCVC = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <CVC label="Security code" onFocusField={() => {}} {...props} />
        </CoreProvider>
    );
};

describe('CVC', () => {
    test('should not render an error message when there is no errorCode', () => {
        renderCVC();
        expect(screen.queryByText(/enter/i)).not.toBeInTheDocument();
    });

    test('should show the "3 digits on back of card" hint for non-Amex brands', () => {
        renderCVC({ errorCode: 'cc.cvc.920', frontCVC: false });

        expect(screen.getByText('Enter the security code. 3 digits on back of card.')).toBeInTheDocument();
    });

    test('should show the "4 digits on front of card" hint for Amex', () => {
        renderCVC({ errorCode: 'cc.cvc.920', frontCVC: true });

        expect(screen.getByText('Enter the security code. 4 digits on front of card.')).toBeInTheDocument();
    });

    test('should pick the Amex variant per error code (incomplete vs invalid)', () => {
        renderCVC({ errorCode: 'cc.cvc.921', frontCVC: true });

        expect(screen.getByText('Enter the complete security code. 4 digits on front of card.')).toBeInTheDocument();
    });
});
