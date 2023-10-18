import { mock } from 'jest-mock-extended';
import { ICore } from '../../src/core/types';
import PaymentMethods from '../../src/core/ProcessResponse/PaymentMethods';

function setupCoreMock() {
    const core = mock<ICore>();
    core.paymentMethodsResponse = new PaymentMethods({
        paymentMethods: [{ name: 'Card', type: 'scheme' }]
    });
    return core;
}

global.core = setupCoreMock();
