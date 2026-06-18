import UIElement from '../../internal/UIElement';
import { TxVariants } from '../../tx-variants';

import type { OrderStatus } from '../../../types/global-types';
import type { GooglePayConfiguration } from '../../GooglePay/types';
import { GooglePaymentMode } from '../../GooglePay/config';

type ResolvedDropinElements = [
    storedPaymentElements: UIElement[],
    elements: UIElement[],
    instantPaymentElements: UIElement[],
    fastlanePaymentElement: UIElement[],
    orderStatus: OrderStatus
];

interface PromotableGooglePay {
    mode?: GooglePaymentMode;
    props: GooglePayConfiguration;
}

const isGooglePayElement = (element: UIElement): boolean =>
    element.type === (TxVariants.googlepay as string) || element.type === (TxVariants.paywithgoogle as string);

/**
 * A GooglePay element is promotable when the accelerated checkout experiment is enabled and the
 * component resolved to the accelerated checkout mode during its availability check.
 */
const isPromotableGooglePay = (element: UIElement): boolean => {
    if (!isGooglePayElement(element)) {
        return false;
    }

    const googlePay = element as PromotableGooglePay;
    return googlePay.props.configuration?.acceleratedCheckoutExperiment === 'enabled' && googlePay.mode === GooglePaymentMode.ACCELERATED_CHECKOUT;
};

/**
 * Promotes the GooglePay element when it is participating in the accelerated checkout experiment.
 *
 * Picks the GooglePay component wherever it is (regular or instant payment elements) and, if promotable,
 * removes it from its original list and prepends it as the first stored payment element. It also flags the
 * element with `oneClick` so the stored payment method list can open it at the top.
 *
 * @param resolvedElements - The Drop-in elements resolved from `onCreateElements`, plus the order status
 * @returns The (possibly reshuffled) Drop-in elements in the same tuple shape
 * @internal
 */
const promoteGooglePayIfNeeded = ([
    storedPaymentElements,
    elements,
    instantPaymentElements,
    fastlanePaymentElement,
    orderStatus
]: ResolvedDropinElements): ResolvedDropinElements => {
    const googlePay = elements.find(isPromotableGooglePay) ?? instantPaymentElements.find(isPromotableGooglePay);

    if (!googlePay) {
        return [storedPaymentElements, elements, instantPaymentElements, fastlanePaymentElement, orderStatus];
    }

    googlePay.props.oneClick = true;

    return [
        [googlePay, ...storedPaymentElements],
        elements.filter(element => element !== googlePay),
        instantPaymentElements.filter(element => element !== googlePay),
        fastlanePaymentElement,
        orderStatus
    ];
};

export default promoteGooglePayIfNeeded;
