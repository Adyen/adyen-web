import { mock } from 'jest-mock-extended';
import { ICore } from '../../src/core/types';
import PaymentMethods from '../../src/core/ProcessResponse/PaymentMethods';
import { AnalyticsModule } from '../../src/types/global-types';
import { Resources } from '../../src/core/Context/Resources';
import Language from '../../src/language';
import CheckoutSession from '../../src/core/CheckoutSession';
import { SRPanel } from '../../src/core/Errors/SRPanel';
import enUS from '../../../server/translations/en-US.json';

interface SetupCoreMockProps {
    mockSessions?: boolean;
    paymentMethods?: PaymentMethods;
}

function setupCoreMock({ mockSessions = true, paymentMethods = null }: SetupCoreMockProps = {}): ICore {
    const core = mock<ICore>({});

    const analytics = mock<AnalyticsModule>();
    const resources = mock<Resources>();
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
        analytics,
        resources,
        i18n,
        srPanel
    };

    return core;
}

export { setupCoreMock };
