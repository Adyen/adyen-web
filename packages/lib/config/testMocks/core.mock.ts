import { mock } from 'jest-mock-extended';
import { ICore } from '../../src/core/types';
import PaymentMethods from '../../src/core/ProcessResponse/PaymentMethods';
import { IAnalytics } from '../../src/core/Analytics/Analytics';

function setupCoreMock() {
    const core = mock<ICore>({});
    core.paymentMethodsResponse = new PaymentMethods({
        paymentMethods: [{ name: 'Card', type: 'scheme' }]
    });
    core.options.countryCode = 'NL';

    // @ts-ignore Disable TS check because the 'modules' is read-only.
    core.modules.analytics = mock<IAnalytics>();

    return core;
}

global.core = setupCoreMock();
