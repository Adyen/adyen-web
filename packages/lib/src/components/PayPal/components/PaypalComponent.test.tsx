import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PaypalComponent from './PaypalComponent';
import { mock } from 'jest-mock-extended';
import { PayPalComponentProps } from './types';

describe('PaypalComponent', () => {
    test('should render a loading spinner', async () => {
        const props = mock<PayPalComponentProps>({
            configuration: {
                merchantId: 'TestMerchant',
                intent: 'authorize'
            }
        });
        render(<PaypalComponent {...props} />);
        screen.getByTestId('spinner');
    });
});
