import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AddressElement from './Address';
import { render } from '@testing-library/preact';

describe('Address standalone component', () => {
    test('should send rendered analytics event', () => {
        const core = setupCoreMock();

        const address = new AddressElement(core, { i18n: global.i18n, onChange: jest.fn() });
        render(address.render());

        expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
            component: 'address',
            configData: {
                onChange: 'function'
            },
            timestamp: expect.any(String),
            id: expect.any(String),
            type: 'rendered'
        });
    });
});
