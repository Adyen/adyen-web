import promoteGooglePayIfNeeded from './promoteGooglePay';
import { TxVariants } from '../../tx-variants';
import { GooglePaymentMode } from '../../GooglePay/config';
import UIElement from '../../internal/UIElement';

const makeElement = (type: string): UIElement => ({ type }) as unknown as UIElement;

const makeGooglePay = ({
    type = TxVariants.googlepay,
    experiment = 'enabled',
    mode = GooglePaymentMode.ACCELERATED_CHECKOUT
}: {
    type?: string;
    experiment?: 'enabled' | 'disabled';
    mode?: GooglePaymentMode;
} = {}): UIElement =>
    ({
        type,
        mode,
        props: { configuration: { acceleratedCheckoutExperiment: experiment } }
    }) as unknown as UIElement;

describe('Drop-in: promoteGooglePayIfNeeded', () => {
    test('should promote GooglePay from "elements" to the front of "storedPaymentElements" when experiment enabled and mode is accelerated', () => {
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

    test('should promote GooglePay from "instantPaymentElements" when promotable', () => {
        const googlePay = makeGooglePay();

        const [stored, elements, instant] = promoteGooglePayIfNeeded([[], [], [googlePay], [], null]);

        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
        expect(instant).toEqual([]);
    });

    test('should prepend GooglePay even when there are no stored payment elements', () => {
        const googlePay = makeGooglePay();

        const [stored, elements] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
    });

    test('should set "oneClick" to true on the promoted GooglePay so it can open at the top of the stored list', () => {
        const googlePay = makeGooglePay();

        const [stored] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored[0].props.oneClick).toBe(true);
    });

    test('should NOT set "oneClick" when GooglePay is not promoted', () => {
        const googlePay = makeGooglePay({ experiment: 'disabled' });

        promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(googlePay.props.oneClick).toBeUndefined();
    });

    test('should identify the "paywithgoogle" tx variant the same as "googlepay"', () => {
        const googlePay = makeGooglePay({ type: TxVariants.paywithgoogle });

        const [stored, elements] = promoteGooglePayIfNeeded([[], [googlePay], [], [], null]);

        expect(stored).toEqual([googlePay]);
        expect(elements).toEqual([]);
    });

    test('should NOT promote when the experiment is disabled', () => {
        const googlePay = makeGooglePay({ experiment: 'disabled' });
        const card = makeElement(TxVariants.scheme);

        const [stored, elements] = promoteGooglePayIfNeeded([[], [card, googlePay], [], [], null]);

        expect(stored).toEqual([]);
        expect(elements).toEqual([card, googlePay]);
    });

    test('should NOT promote when the mode is not accelerated checkout', () => {
        const googlePay = makeGooglePay({ mode: GooglePaymentMode.STANDARD_BUTTON });

        const [stored, , instant] = promoteGooglePayIfNeeded([[], [], [googlePay], [], null]);

        expect(stored).toEqual([]);
        expect(instant).toEqual([googlePay]);
    });

    test('should leave the arrays unchanged when there is no GooglePay element', () => {
        const card = makeElement(TxVariants.scheme);
        const storedCard = makeElement(TxVariants.scheme);

        const result = promoteGooglePayIfNeeded([[storedCard], [card], [], [], null]);

        expect(result).toEqual([[storedCard], [card], [], [], null]);
    });
});
