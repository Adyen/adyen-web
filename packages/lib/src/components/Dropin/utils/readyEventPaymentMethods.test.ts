import { mock } from 'jest-mock-extended';
import UIElement from '../../internal/UIElement/UIElement';
import { getReadyPaymentMethods, getUnavailablePaymentMethods } from './readyEventPaymentMethods';
import type { ICore } from '../../../core/types';
import type { PaymentMethod, StoredPaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';
import type { PaymentMethodDisplayModeEntry, PaymentMethodDisplayMode } from '../types';

const emptyReadyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = {
    fastlane: [],
    instant: [],
    stored: [],
    regular: []
};

describe('getReadyPaymentMethods', () => {
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
        const result = getReadyPaymentMethods(['fastlane', 'instant', 'stored', 'regular'], emptyReadyByMode, core);
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

        const result = getReadyPaymentMethods(['fastlane', 'instant', 'stored', 'regular'], readyByMode, core);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: 'alipay', displayMode: 'instant' });
        expect(result[1]).toMatchObject({ type: 'kakaopay', displayMode: 'regular' });
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

        const result = getReadyPaymentMethods(['fastlane', 'instant', 'stored', 'regular'], readyByMode, core);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ type: 'alipay', displayMode: 'instant' });
        expect(result[1]).toMatchObject({ type: 'scheme', displayMode: 'stored' });
        expect(result[2]).toMatchObject({ type: 'kakaopay', displayMode: 'regular' });

        expect(core.paymentMethodsResponse.findById).toHaveBeenCalledWith('alipay-id');
        expect(core.paymentMethodsResponse.findById).toHaveBeenCalledWith('kakao-id');
        expect(core.paymentMethodsResponse.findStoredPaymentMethod).toHaveBeenCalledWith('stored-1');
    });
});

describe('getUnavailablePaymentMethods', () => {
    const alipay: PaymentMethod = { _id: 'alipay-id', type: 'alipay', name: 'AliPay' };
    const kakaopay: PaymentMethod = { _id: 'kakao-id', type: 'kakaopay', name: 'KakaoPay' };

    test('returns empty array when all baseline PMs are ready', () => {
        const alipayEl = mock<UIElement>({ props: { paymentMethodId: 'alipay-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [alipay] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [alipayEl] };

        expect(getUnavailablePaymentMethods(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('includes PMs absent from readyByMode', () => {
        const ideal: PaymentMethod = { _id: 'ideal-id', type: 'ideal', name: 'iDEAL' };
        const idealEl = mock<UIElement>({ props: { paymentMethodId: 'ideal-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [alipay, ideal, kakaopay] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [idealEl] };

        const result = getUnavailablePaymentMethods(displayModeEntries, readyByMode);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: 'alipay', displayMode: 'regular' });
        expect(result[1]).toMatchObject({ type: 'kakaopay', displayMode: 'regular' });
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

        expect(getUnavailablePaymentMethods(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('excludes upi sub-variants when the upi parent is ready', () => {
        const upi: PaymentMethod = { _id: 'upi-id', type: 'upi', name: 'UPI' };
        const upiIntent: PaymentMethod = { _id: 'upi-intent-id', type: 'upi_intent', name: 'UPI Intent' };
        const upiEl = mock<UIElement>({ props: { paymentMethodId: 'upi-id' } });

        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [upi, upiIntent] }];
        const readyByMode: Record<PaymentMethodDisplayMode, UIElement[]> = { ...emptyReadyByMode, regular: [upiEl] };

        expect(getUnavailablePaymentMethods(displayModeEntries, readyByMode)).toEqual([]);
    });

    test('includes standalone upi sub-variants when no upi parent exists in the baseline', () => {
        const upiIntent: PaymentMethod = { _id: 'upi-intent-id', type: 'upi_intent', name: 'UPI Intent' };
        const displayModeEntries: PaymentMethodDisplayModeEntry[] = [{ displayMode: 'regular', paymentMethods: [upiIntent] }];

        const result = getUnavailablePaymentMethods(displayModeEntries, emptyReadyByMode);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ type: 'upi_intent', displayMode: 'regular' });
    });
});
