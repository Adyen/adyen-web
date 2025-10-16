import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PaypalComponent from './PaypalComponent';
import { mock } from 'jest-mock-extended';
import { PayPalComponentProps } from './types';
import { AnalyticsModule } from '../../../types/global-types';
import { CoreProvider } from '../../../core/Context/CoreProvider';

const mockAnalytics = mock<AnalyticsModule>();

const customRender = (props: PayPalComponentProps) =>
    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources} analytics={mockAnalytics}>
            <PaypalComponent {...props} />
        </CoreProvider>
    );

describe('PaypalComponent', () => {
    test('should render a loading spinner', () => {
        const props = mock<PayPalComponentProps>({
            configuration: {
                merchantId: 'TestMerchant',
                intent: 'authorize'
            },
            onScriptLoadFailure: jest.fn()
        });
        customRender(props);
        screen.getByTestId('spinner');
    });
});
