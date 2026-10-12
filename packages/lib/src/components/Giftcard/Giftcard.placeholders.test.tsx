import { render } from '@testing-library/preact';
import Giftcard from './Giftcard';
import initCSF from '../internal/SecuredFields/lib/CSF';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import type { CSFSetupObject } from '../internal/SecuredFields/lib/CSF/types';

jest.mock('../internal/SecuredFields/lib/CSF');

const initCSFMock = initCSF as jest.MockedFunction<typeof initCSF>;

describe('Giftcard placeholders', () => {
    const core = setupCoreMock();

    const baseProps = {
        modules: { analytics: core.modules.analytics, resources: core.modules.resources },
        clientKey: 'mock',
        amount: { value: 1000, currency: 'EUR' },
        name: 'My Test Gift Card',
        type: 'giftcard',
        i18n: core.modules.i18n,
        loadingContext: 'mock'
    };

    const brandsConfiguration = {
        generic: { placeholders: { cardNumber: '0000 0000 0000 0000 000', securityCode: '123' } },
        svs: { placeholders: { cardNumber: '1111 1111 1111 1111' } }
    };

    const topLevelPlaceholders = { cardNumber: '2207 8500 1234 5678 0000 1', securityCode: '1234' };

    const renderAndGetSetupObject = (brand: string): CSFSetupObject => {
        initCSFMock.mockClear();

        const giftcard = new Giftcard(core, { ...baseProps, brand, brandsConfiguration, placeholders: topLevelPlaceholders });
        render(giftcard.render());

        return initCSFMock.mock.calls[0][0];
    };

    test('should send the brand specific placeholders to the secured fields', () => {
        expect(renderAndGetSetupObject('generic').placeholders).toEqual(brandsConfiguration.generic.placeholders);
    });

    test('should send different placeholders for different brands', () => {
        const generic = renderAndGetSetupObject('generic').placeholders;
        const givex = renderAndGetSetupObject('givex').placeholders;

        expect(generic).not.toEqual(givex);
    });

    test('should fall back to the top-level placeholders for a brand without its own configuration', () => {
        expect(renderAndGetSetupObject('givex').placeholders).toEqual(topLevelPlaceholders);
    });

    test('should fall back to the top-level placeholders for the keys a brand does not define', () => {
        expect(renderAndGetSetupObject('svs').placeholders).toEqual({
            cardNumber: '1111 1111 1111 1111',
            securityCode: '1234'
        });
    });
});
