import { mock } from 'jest-mock-extended';
import UIElement from '../../internal/UIElement/UIElement';
import { createAvailablePaymentsList, createUnavailablePaymentsList, type PaymentMethodDisplayModeEntry } from './paymentMethodsAnalytics';
import type { ICore } from '../../../core/types';
import type { PaymentMethod, StoredPaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';
import type { PaymentMethodDisplayMode } from '../types';

const emptyReadyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = {
    fastlane: [],
    instant: [],
    stored: [],
    regular: []
};

describe('createAvailablePaymentsList', () => {
    const alipay: PaymentMethod = { _id: 'alipay-id', type: 'alipay', name: 'AliPay' };
    const kakaopay: PaymentMethod = { _id: 'kakao-id', type: 'kakaopay', name: 'KakaoPay' };
    const stored1: StoredPaymentMethod = {
        type: 'scheme',
        name: 'Visa',
        id: 'stored-1',
        supportedShopperInteractions: [],
        storedPaymentMethodId: 'stored-1'
    };

    let core: ICore;

    beforeEach(() => {
        core = {
            paymentMethodsResponse: {
                findById: jest.fn().mockImplementation((id: string) => {
                    if (id === 'alipay-id') return alipay;
                    if (id === 'kakao-id') return kakaopay;
                    return undefined;
                }),
                findStoredPaymentMethod: jest.fn().mockImplementation((id: string) => {
                    if (id === 'stored-1') return stored1;
                    return undefined;
                })
            }
        } as unknown as ICore;
    });

    test('returns empty array when no modes have ready elements', () => {
        const result = createAvailablePaymentsList(['fastlane', 'instant', 'stored', 'regular'], emptyReadyByMode, core);
        expect(result).toEqual([]);
    });

    test('preserves order from display modes parameter', () => {
        const alipayEl = mock<UIElement>({ props: { paymentMethodId: 'alipay-id' } });
        const kakaoEl = mock<UIElement>({ props: { paymentMethodId: 'kakao-id' } });

        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = {
            ...emptyReadyByMode,
            instant: [alipayEl],
            regular: [kakaoEl]
        };

        const result = createAvailablePaymentsList(['fastlane', 'instant', 'stored', 'regular'], readyByMode, core);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ paymentMethodType: 'alipay', displayMode: 'instant' });
        expect(result[1]).toMatchObject({ paymentMethodType: 'kakaopay', displayMode: 'regular' });
    });

    test('resolves ready payment methods across different display modes and kinds', () => {
        const alipayEl = mock<UIElement>({ props: { paymentMethodId: 'alipay-id' } });
        const kakaoEl = mock<UIElement>({ props: { paymentMethodId: 'kakao-id' } });
        const storedEl = mock<UIElement>({ props: { storedPaymentMethodId: 'stored-1' } });

        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = {
            ...emptyReadyByMode,
            instant: [alipayEl],
            stored: [storedEl],
            regular: [kakaoEl]
        };

        const result = createAvailablePaymentsList(['fastlane', 'instant', 'stored', 'regular'], readyByMode, core);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ paymentMethodType: 'alipay', displayMode: 'instant' });
        expect(result[1]).toMatchObject({ paymentMethodType: 'scheme', displayMode: 'stored' });
        expect(result[2]).toMatchObject({ paymentMethodType: 'kakaopay', displayMode: 'regular' });

        expect(core.paymentMethodsResponse.findById).toHaveBeenCalledWith('alipay-id');
        expect(core.paymentMethodsResponse.findById).toHaveBeenCalledWith('kakao-id');
        expect(core.paymentMethodsResponse.findStoredPaymentMethod).toHaveBeenCalledWith('stored-1');
    });
});

describe('createUnavailablePaymentsList', () => {
    const alipay: PaymentMethod = { _id: 'alipay-id', type: 'alipay', name: 'AliPay' };
    const kakaopay: PaymentMethod = { _id: 'kakao-id', type: 'kakaopay', name: 'KakaoPay' };

    test('returns empty array when all baseline PMs are ready', () => {
        const alipayEl = mock<UIElement>({ props: { paymentMethodId: 'alipay-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [alipay] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [alipayEl] };

        expect(createUnavailablePaymentsList(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('includes PMs absent from readyByMode', () => {
        const ideal: PaymentMethod = { _id: 'ideal-id', type: 'ideal', name: 'iDEAL' };
        const idealEl = mock<UIElement>({ props: { paymentMethodId: 'ideal-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [alipay, ideal, kakaopay] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [idealEl] };

        const result = createUnavailablePaymentsList(displayModeEntries, readyByMode);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ paymentMethodType: 'alipay', displayMode: 'regular' });
        expect(result[1]).toMatchObject({ paymentMethodType: 'kakaopay', displayMode: 'regular' });
    });

    test('uses storedPaymentMethodId for stored section id matching', () => {
        const stored: StoredPaymentMethod = {
            type: 'scheme',
            name: 'Visa',
            id: 'stored-1',
            supportedShopperInteractions: [],
            storedPaymentMethodId: 'stored-1'
        };
        const storedEl = mock<UIElement>({ props: { storedPaymentMethodId: 'stored-1' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'stored', paymentMethods: [stored] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, stored: [storedEl] };

        expect(createUnavailablePaymentsList(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('excludes upi sub-variants when the upi parent is ready', () => {
        const upi: PaymentMethod = { _id: 'upi-id', type: 'upi', name: 'UPI' };
        const upiIntent: PaymentMethod = { _id: 'upi-intent-id', type: 'upi_intent', name: 'UPI Intent' };
        const upiEl = mock<UIElement>({ props: { paymentMethodId: 'upi-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [upi, upiIntent] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [upiEl] };

        expect(createUnavailablePaymentsList(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('includes standalone upi sub-variants when no upi parent exists in the baseline', () => {
        const upiIntent: PaymentMethod = { _id: 'upi-intent-id', type: 'upi_intent', name: 'UPI Intent' };
        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [upiIntent] }];

        const result = createUnavailablePaymentsList(displayModeEntries, emptyReadyByMode);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ paymentMethodType: 'upi_intent', displayMode: 'regular' });
    });
});

describe('analytics payment method sanitization', () => {
    test('picks only the fixed set of safe fields', () => {
        const scheme = {
            _id: 'scheme-id',
            type: 'scheme',
            name: 'Card',
            brands: ['visa', 'mc'],
            brand: 'visa',
            issuers: [{ id: 'issuer-1', name: 'Bank' }],
            configuration: { merchantId: 'test' },
            fundingSource: 'debit',
            group: { name: 'Cards', paymentMethodData: 'data', type: 'scheme' }
        } as unknown as PaymentMethod;
        const schemeEl = mock<UIElement>({ props: { paymentMethodId: 'scheme-id' } });
        const core = {
            paymentMethodsResponse: { findById: jest.fn().mockReturnValue(scheme) }
        } as unknown as ICore;

        const [result] = createAvailablePaymentsList(['regular'], { ...emptyReadyByMode, regular: [schemeEl] }, core);

        expect(result.paymentMethodType).toBe('scheme');
        expect(result.brands).toEqual(['visa', 'mc']);
        expect(result.fundingSource).toBe('debit');
        expect(result.displayMode).toBe('regular');
        expect(result).not.toHaveProperty('name');
        expect(result).not.toHaveProperty('issuers');
        expect(result).not.toHaveProperty('configuration');
        expect(result).not.toHaveProperty('group');
        expect(result).not.toHaveProperty('brand');
    });

    test('omits optional fields when absent on the raw object', () => {
        const alipay = { _id: 'alipay-id', type: 'alipay', name: 'AliPay' } as PaymentMethod;
        const alipayEl = mock<UIElement>({ props: { paymentMethodId: 'alipay-id' } });
        const core = {
            paymentMethodsResponse: { findById: jest.fn().mockReturnValue(alipay) }
        } as unknown as ICore;

        const [result] = createAvailablePaymentsList(['instant'], { ...emptyReadyByMode, instant: [alipayEl] }, core);

        expect(result).not.toHaveProperty('brands');
        expect(result).not.toHaveProperty('brand');
        expect(result).not.toHaveProperty('fundingSource');
        expect(result).not.toHaveProperty('name');
    });

    test('normalizes a single "brand" string into a "brands" array for payment methods like giftcard', () => {
        const giftcard = { _id: 'giftcard-id', type: 'giftcard', name: 'My Store Loyalty Card', brand: 'mystore_loyal' } as PaymentMethod;
        const giftcardEl = mock<UIElement>({ props: { paymentMethodId: 'giftcard-id' } });
        const core = {
            paymentMethodsResponse: { findById: jest.fn().mockReturnValue(giftcard) }
        } as unknown as ICore;

        const [result] = createAvailablePaymentsList(['regular'], { ...emptyReadyByMode, regular: [giftcardEl] }, core);

        expect(result).toEqual({ paymentMethodType: 'giftcard', brands: ['mystore_loyal'], displayMode: 'regular' });
        expect(result).not.toHaveProperty('brand');
    });

    test('strips PII and internal fields from stored payment methods', () => {
        const stored = {
            type: 'scheme',
            name: 'Visa',
            id: 'stored-1',
            supportedShopperInteractions: [],
            storedPaymentMethodId: 'stored-1',
            isStoredPaymentMethod: true,
            holderName: 'John Doe',
            shopperEmail: 'john@example.com',
            lastFour: '1234',
            iban: 'NL02ABNA0123456789',
            ownerName: 'John Doe',
            label: 'Visa **** 1234'
        } as unknown as StoredPaymentMethod;

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'stored', paymentMethods: [stored] }];

        const [result] = createUnavailablePaymentsList(displayModeEntries, emptyReadyByMode);

        expect(result).not.toHaveProperty('holderName');
        expect(result).not.toHaveProperty('shopperEmail');
        expect(result).not.toHaveProperty('lastFour');
        expect(result).not.toHaveProperty('iban');
        expect(result).not.toHaveProperty('ownerName');
        expect(result).not.toHaveProperty('label');
        expect(result).not.toHaveProperty('storedPaymentMethodId');
        expect(result).not.toHaveProperty('isStoredPaymentMethod');
        expect(result).not.toHaveProperty('name');
        expect(result.paymentMethodType).toBe('scheme');
        expect(result.displayMode).toBe('stored');
    });
});
