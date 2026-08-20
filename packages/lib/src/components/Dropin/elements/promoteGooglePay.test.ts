import promoteGooglePayIfNeeded from './promoteGooglePay';
import { TxVariants } from '../../tx-variants';
import { GooglePaymentMode } from '../../GooglePay/config';
import GooglePay from '../../GooglePay/GooglePay';
import GooglePayService from '../../GooglePay/GooglePayService';
import GoogleAcceleratedCheckoutClient from '../../GooglePay/services/GoogleAcceleratedCheckoutClient';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import UIElement from '../../internal/UIElement';

jest.mock('../../GooglePay/GooglePayService');
jest.mock('../../GooglePay/services/GoogleAcceleratedCheckoutClient');

const makeElement = (type: string): UIElement => ({ type }) as unknown as UIElement;

const makeGooglePay = ({
    experiment = 'enabled',
    shopperEligible = true,
    mode = GooglePaymentMode.ACCELERATED_CHECKOUT
}: {
    experiment?: 'enabled' | 'disabled';
    shopperEligible?: boolean;
    mode?: GooglePaymentMode;
} = {}): GooglePay => {
    const googlePay = new GooglePay(setupCoreMock(), {
        configuration: { merchantId: 'merchant-id', gatewayMerchantId: 'gateway-id', acceleratedCheckoutExperiment: experiment }
    });

    googlePay.isShopperEligibleForAcceleratedCheckout = shopperEligible;
    googlePay.mode = mode;

    return googlePay;
};

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    GooglePayService.mockClear();
    // @ts-ignore 'mockClear' is provided by jest.mock
    GoogleAcceleratedCheckoutClient.mockClear();
});

describe('Drop-in: promoteGooglePayIfNeeded', () => {
    test('should promote GooglePay from "elements" to the front of "storedPaymentElements" when shopper is eligible', () => {
        const googlePay = makeGooglePay();
        const card = makeElement(TxVariants.scheme);
        const storedCard = makeElement(TxVariants.scheme);

        const [stored, elements, instant, fastlane, orderStatus] = promoteGooglePayIfNeeded([[storedCard], [card, googlePay], [], [], null]);

        expect(stored).toEqual([googlePay, storedCard]);
        expect(elements).toEqual([card]);
        expect(instant).toEqual([]);
        expect(fastlane).toEqual([]);
        expect(orderStatus).toBeNull();
    });

    test('should promote GooglePay from "instantPaymentElements" when shopper is eligible', () => {
        const googlePay = makeGooglePay();

        const [stored, elements, instant] = promoteGooglePayIfNeeded([[], [], [googlePay], [], null]);

        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
        expect(instant).toEqual([]);
    });

    test('should promote GooglePay even when there are no stored payment elements', () => {
        const googlePay = makeGooglePay();

        const [stored, elements] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
    });

    test('should promote GooglePay when shopper is eligible but experiment is not enabled', () => {
        const googlePay = makeGooglePay({ experiment: 'disabled', shopperEligible: true });

        const [stored, elements] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored[0].props.oneClick).toBe(true);
        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
    });

    test('should set "oneClick" to true on the promoted GooglePay so it can open at the top of the stored list', () => {
        const googlePay = makeGooglePay();

        const [stored] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored[0].props.oneClick).toBe(true);
    });

    test('should NOT set "oneClick" when shopper is not eligible', () => {
        const googlePay = makeGooglePay({ shopperEligible: false });

        promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(googlePay.props.oneClick).toBeUndefined();
    });

    test('should NOT promote when the shopper is not eligible', () => {
        const googlePay = makeGooglePay({ experiment: 'enabled', shopperEligible: false });
        const card = makeElement(TxVariants.scheme);

        const [stored, elements] = promoteGooglePayIfNeeded([[], [card, googlePay], [], [], null]);

        expect(stored).toEqual([]);
        expect(elements).toEqual([card, googlePay]);
    });

    test('should leave the arrays unchanged when there is no GooglePay element', () => {
        const card = makeElement(TxVariants.scheme);
        const storedCard = makeElement(TxVariants.scheme);

        const result = promoteGooglePayIfNeeded([[storedCard], [card], [], [], null]);

        expect(result).toEqual([[storedCard], [card], [], [], null]);
    });
});
