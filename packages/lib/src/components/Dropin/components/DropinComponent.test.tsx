import { mock } from 'jest-mock-extended';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { render } from '@testing-library/preact';
import { ANALYTICS_RENDERED_STR } from '../../../core/Analytics/constants';
import CoreProvider from '../../../core/Context/CoreProvider';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { h } from 'preact';
import DropinComponent from './DropinComponent';

jest.mock('./PaymentMethod/PaymentMethodList', () => () => <div>Mocked Component</div>);
const srPanel = mock<SRPanel>();
const mockSendAnalytics = jest.fn();
const analytics = {
    sendAnalytics: mockSendAnalytics
};
const customRender = ui => {
    return render(
        // @ts-ignore render ui as children
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>{ui}</SRPanelProvider>
        </CoreProvider>
    );
};
afterEach(() => {
    jest.restoreAllMocks();
});

describe('Analytics', () => {
    test('should send the analytic config data after the payment method data is ready', async () => {
        const mockOnCreateElements = jest.fn().mockImplementation(() => [[Promise.resolve()], [Promise.resolve()], [Promise.resolve()]]);
        const props = {
            onChange: jest.fn(),
            modules: { srPanel, analytics, resources: global.resources },
            onCreateElements: mockOnCreateElements,
            openFirstStoredPaymentMethod: true,
            showStoredPaymentMethods: false
        };
        // @ts-ignore test only
        customRender(<DropinComponent {...props} />);
        await new Promise(process.nextTick);
        expect(mockSendAnalytics).toHaveBeenCalledWith('dropin', {
            type: ANALYTICS_RENDERED_STR,
            configData: { openFirstStoredPaymentMethod: true, showStoredPaymentMethods: false }
        });
    });
});
