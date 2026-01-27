import { mock } from 'jest-mock-extended';
import { ICore } from '../../src/core/types';
import PaymentMethods from '../../src/core/ProcessResponse/PaymentMethods';
import { Resources } from '../../src/core/Context/Resources';
import Language from '../../src/language';
import CheckoutSession from '../../src/core/CheckoutSession';
import { SRPanel } from '../../src/core/Errors/SRPanel';
import enUS from '../../../server/translations/en-US.json';
import type { IAnalytics } from '../../src/core/Analytics/Analytics';
import { setupResourceMock } from './resourcesMock';
import RiskModule from '../../src/core/RiskModule';

interface SetupCoreMockProps {
    mockSessions?: boolean;
    paymentMethods?: PaymentMethods;
    analyticsMock?: IAnalytics;
    riskMock?: RiskModule;
}

export const TEST_CHECKOUT_ATTEMPT_ID = 'test-checkout-attempt-id';
export const TEST_RISK_DATA = 'test-risk-data';

function setupCoreMock({ mockSessions = true, paymentMethods = null, analyticsMock = null, riskMock = null }: SetupCoreMockProps = {}): ICore {
    const core = mock<ICore>({});

    const analytics = analyticsMock || mock<IAnalytics>({ checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID });
    const risk = riskMock || mock<RiskModule>({ data: TEST_RISK_DATA });

    const resources = setupResourceMock();
    const i18n = new Language({ locale: 'en-US', translations: enUS });
    const srPanel = new SRPanel(core, {
        moveFocus: true,
        enabled: false
    });

    core.paymentMethodsResponse = paymentMethods || new PaymentMethods({});

    if (mockSessions) {
        core.session = mock<CheckoutSession>();
    }

    // @ts-ignore Disable TS check because the 'modules' is read-only.
    core.modules = {
        risk,
        analytics,
        resources,
        i18n,
        srPanel
    };

    return core;
}

export { setupCoreMock };
