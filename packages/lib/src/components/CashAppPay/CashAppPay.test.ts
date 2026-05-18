import CashAppPay from './CashAppPay';
import { render, screen } from '@testing-library/preact';
import CashAppService from './services/CashAppService';
import { CashAppPayEventData } from './types';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('./services/CashAppService');
jest.spyOn(CashAppService.prototype, 'subscribeToEvent').mockImplementation(() => () => {});
const mockCreateCustomerRequest = jest.spyOn(CashAppService.prototype, 'createCustomerRequest').mockResolvedValue();
const mockBegin = jest.spyOn(CashAppService.prototype, 'begin').mockImplementation();

describe('CashAppPay', () => {
    beforeEach(() => {
        // @ts-ignore 'mockClear' is provided by jest.mock
        CashAppService.mockClear();
        mockCreateCustomerRequest.mockClear();
        mockBegin.mockClear();
    });

    test('should return on-file data if available', () => {
        const onFileGrantId = 'xxxx-yyyy';
        const customerId = 'abcdef';
        const cashTag = '$john-doe';
        const core = setupCoreMock();

        const cashAppPayElement = new CashAppPay(core, { storePaymentMethod: true });

        const data: CashAppPayEventData = {
            onFileGrantId,
            cashTag,
            customerId
        };

        cashAppPayElement.setState({ data });

        expect(cashAppPayElement.formatData()).toEqual({
            paymentMethod: { type: 'cashapp', onFileGrantId, customerId, cashtag: cashTag },
            storePaymentMethod: true
        });
    });

    test('should return grantId, customerId and correct txVariant', () => {
        const grantId = 'xxxx-yyyy';
        const customerId = 'abcdef';
        const core = setupCoreMock();

        const cashAppPayElement = new CashAppPay(core);

        const data: CashAppPayEventData = {
            grantId,
            customerId
        };

        cashAppPayElement.setState({ data });

        expect(cashAppPayElement.formatData()).toEqual({ paymentMethod: { type: 'cashapp', grantId, customerId } });
    });

    test('should initially display the loading spinner while SDK is being loaded', async () => {
        const core = setupCoreMock();

        const cashAppPayElement = new CashAppPay(core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });
        render(cashAppPayElement.render());

        expect(CashAppService).toHaveBeenCalledTimes(1);
        expect(await screen.findByTestId('spinner')).toBeTruthy();
    });

    test('should create customer request and then begin CashApp flow when submit is triggered', async () => {
        const onClick = jest.fn().mockImplementation(actions => actions.resolve());
        const core = setupCoreMock();

        const cashAppPayElement = new CashAppPay(core, {
            onClick,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });
        render(cashAppPayElement.render());

        cashAppPayElement.submit();

        expect(onClick).toHaveBeenCalledTimes(1);

        await new Promise(process.nextTick);

        expect(mockCreateCustomerRequest).toHaveBeenCalledTimes(1);
        expect(mockBegin).toHaveBeenCalledTimes(1);
    });

    test('should always return isValid as true', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core);
        expect(cashAppPayElement.isValid).toBe(true);
    });

    test('should format storedPaymentMethodId data correctly', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { storedPaymentMethodId: 'stored-123' });
        expect(cashAppPayElement.formatData()).toEqual({
            paymentMethod: {
                type: 'cashapp',
                storedPaymentMethodId: 'stored-123'
            }
        });
    });

    test('should return cashtag as displayName when storedPaymentMethodId and cashtag are set', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { storedPaymentMethodId: 'stored-123', cashtag: '$john' });
        expect(cashAppPayElement.displayName).toBe('$john');
    });

    test('should return name as displayName when no storedPaymentMethodId', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { name: 'Cash App Pay' });
        expect(cashAppPayElement.displayName).toBe('Cash App Pay');
    });

    test('should return additionalInfo as "Cash App Pay" for stored payment methods', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { storedPaymentMethodId: 'stored-123' });
        expect(cashAppPayElement.additionalInfo).toBe('Cash App Pay');
    });

    test('should return empty additionalInfo for non-stored payment methods', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core);
        expect(cashAppPayElement.additionalInfo).toBe('');
    });

    test('should call super.submit for stored payment methods', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { storedPaymentMethodId: 'stored-123' });
        cashAppPayElement.setState({ data: {}, valid: {}, errors: {}, isValid: true });
        // submit for stored PM calls super.submit which triggers makePaymentsCall
        // @ts-ignore accessing protected method
        const spy = jest.spyOn(cashAppPayElement, 'makePaymentsCall').mockResolvedValue({ resultCode: 'Authorised' });
        cashAppPayElement.submit();
        expect(spy).toHaveBeenCalled();
    });

    test('should not begin CashApp flow when onClick rejects', async () => {
        const onClick = jest.fn().mockImplementation(actions => actions.reject());
        const core = setupCoreMock();

        const cashAppPayElement = new CashAppPay(core, {
            onClick,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });
        render(cashAppPayElement.render());

        cashAppPayElement.submit();

        await new Promise(process.nextTick);

        expect(mockCreateCustomerRequest).not.toHaveBeenCalled();
        expect(mockBegin).not.toHaveBeenCalled();
    });

    test('should warn when both enableStoreDetails and storePaymentMethod are set', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const core = setupCoreMock();
        new CashAppPay(core, { enableStoreDetails: true, storePaymentMethod: true });
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('enableStoreDetails AND storePaymentMethod'));
    });

    test('should include storePaymentMethod flag when enableStoreDetails is true', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, { enableStoreDetails: true });
        const data = { grantId: 'grant-1', customerId: 'cust-1', shopperWantsToStore: true };
        cashAppPayElement.setState({ data });
        expect(cashAppPayElement.formatData()).toEqual({
            paymentMethod: { type: 'cashapp', grantId: 'grant-1', customerId: 'cust-1' },
            storePaymentMethod: true
        });
    });

    test('should use enableStoreDetails from session configuration', () => {
        const core = setupCoreMock();
        const cashAppPayElement = new CashAppPay(core, {
            // @ts-ignore session config for testing
            session: { configuration: { enableStoreDetails: true } }
        });
        expect(cashAppPayElement.props.enableStoreDetails).toBe(true);
    });
});
