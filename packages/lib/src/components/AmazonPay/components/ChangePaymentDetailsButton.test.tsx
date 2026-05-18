import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import ChangePaymentDetailsButton from './ChangePaymentDetailsButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmazonWindowObject } from '../types';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

const mockAmazonRef: AmazonWindowObject = {
    Pay: {
        renderButton: jest.fn().mockReturnValue({ onClick: jest.fn() }),
        initCheckout: jest.fn(),
        signout: jest.fn(),
        bindChangeAction: jest.fn()
    }
};

const renderChangePaymentDetailsButton = (props = {}) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <ChangePaymentDetailsButton amazonCheckoutSessionId="test-session-id" amazonRef={mockAmazonRef} {...props} />
        </CoreProvider>
    );
};

describe('ChangePaymentDetailsButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render a change address button', () => {
        renderChangePaymentDetailsButton();
        const button = screen.getByTestId('amazon-pay-change-payment-details-button');
        expect(button).toBeInTheDocument();
    });

    test('should call bindChangeAction on mount with correct options', () => {
        renderChangePaymentDetailsButton();
        expect(mockAmazonRef.Pay.bindChangeAction).toHaveBeenCalledWith('.adyen-checkout__amazonpay__button--changeAddress', {
            amazonCheckoutSessionId: 'test-session-id',
            changeAction: 'changeAddress'
        });
    });

    test('should pass the correct checkoutSessionId to bindChangeAction', () => {
        renderChangePaymentDetailsButton({ amazonCheckoutSessionId: 'custom-session-123' });
        expect(mockAmazonRef.Pay.bindChangeAction).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                amazonCheckoutSessionId: 'custom-session-123'
            })
        );
    });
});
