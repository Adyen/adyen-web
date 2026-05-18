import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PaypalComponent from './PaypalComponent';
import { mock } from 'jest-mock-extended';
import { PayPalComponentProps } from './types';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

const customRender = (props: PayPalComponentProps) =>
    render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources} analytics={core.modules.analytics}>
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
            onScriptLoadFailure: jest.fn(),
            setComponentRef: jest.fn()
        });
        customRender(props);
        screen.getByTestId('spinner');
    });
});
