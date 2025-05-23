import { ComponentChild, h, render } from 'preact';
import getProp from '../../../utils/getProp';
import uuid from '../../../utils/uuid';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_RENDERED_STR, NO_CHECKOUT_ATTEMPT_ID } from '../../../core/Analytics/constants';

import type { ICore } from '../../../core/types';
import type { BaseElementProps, IBaseElement } from './types';
import type { PaymentData } from '../../../types/global-types';
import { AnalyticsInitialEvent } from '../../../core/Analytics/types';
import { off, on } from '../../../utils/listenerUtils';
import { AnalyticsInfoEvent } from '../../../core/Analytics/AnalyticsInfoEvent';
import { AnalyticsEvent } from '../../../core/Analytics/AnalyticsEvent';

/**
 * Verify if the first parameter is instance of Core.
 * We do not use 'instanceof' to avoid importing the Core class directly into this class.
 * @param checkout
 */
function assertIsCoreInstance(checkout: ICore): checkout is ICore {
    if (!checkout) return false;
    const isCoreObject = typeof checkout.initialize === 'function' && typeof checkout.createFromAction === 'function';
    return isCoreObject;
}

abstract class BaseElement<P extends BaseElementProps> implements IBaseElement {
    public readonly _id = `${this.constructor['type']}-${uuid()}`;
    public readonly core: ICore;

    public props: P;
    public state: any = {};
    public _component;

    protected _node: HTMLElement = null;

    protected static defaultProps = {};

    constructor(checkout: ICore, props?: P) {
        const isCoreInstance = assertIsCoreInstance(checkout);

        if (!isCoreInstance) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                `Trying to initialise the component '${this.constructor['type']}' without a reference to an instance of AdyenCheckout`
            );
        }

        this.core = checkout;
        this.buildElementProps(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    protected buildElementProps(componentProps?: P) {
        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...componentProps });
    }

    /**
     * Executed during creation of any payment element.
     * Gives a chance to any paymentMethod to format the props we're receiving.
     */
    protected formatProps(props: P) {
        return props;
    }

    /**
     * Executed on the `data` getter.
     * Returns the component data necessary for the /payments request
     */
    protected formatData(): any {
        return {};
    }

    /* eslint-disable-next-line */
    protected setUpAnalytics(setUpAnalyticsObj: AnalyticsInitialEvent) {
        return null;
    }

    /* eslint-disable-next-line */
    protected submitAnalytics(analyticsObj?: AnalyticsEvent) {
        return null;
    }

    /* eslint-disable-next-line */
    protected handleKeyPress(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) {
        return null;
    }

    protected setState(newState: object): void {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Returns the component payment data ready to submit to the Checkout API
     * Note: this does not ensure validity, check isValid first
     */
    public get data(): PaymentData {
        const clientData = getProp(this.props, 'modules.risk.data');
        const checkoutAttemptId = getProp(this.props, 'modules.analytics.getCheckoutAttemptId')?.() ?? NO_CHECKOUT_ATTEMPT_ID; // NOTE: we never expect to see this "failed" value, but, just in case...
        const order = this.state.order || this.props.order;
        const componentData = this.formatData();

        if (componentData.paymentMethod && checkoutAttemptId) {
            componentData.paymentMethod.checkoutAttemptId = checkoutAttemptId;
        }

        return {
            ...(clientData && { riskData: { clientData } }),
            ...(order && { order: { orderData: order.orderData, pspReference: order.pspReference } }),
            ...componentData,
            clientStateDataIndicator: true
        };
    }

    /**
     * Method used to make the payment method active
     * (Useful when there are different payment methods available and activating one PM must trigger a specific task)
     */
    public activate(): void {
        return;
    }

    public render(): ComponentChild | Error {
        // render() not implemented in the element
        throw new Error('Payment method cannot be rendered.');
    }

    /**
     * Mounts an element into the dom
     * @param domNode - Node (or selector) where we will mount the payment element
     * @returns this - the payment element instance we mounted
     */
    public mount(domNode: HTMLElement | string): this {
        const node = typeof domNode === 'string' ? document.querySelector<HTMLElement>(domNode) : domNode;

        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }

        const setupAnalytics = !this._node;

        if (this._node) {
            this.unmount(); // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        }

        this._node = node;

        // Add listener for key press events, notably 'Enter' key presses
        on(this._node, 'keypress', this.handleKeyPress, false);

        this._component = this.render();

        render(this._component, node);

        // Set up analytics (once, since this._node is currently undefined) now that we have mounted and rendered
        if (setupAnalytics) {
            if (this.props.modules && this.props.modules.analytics) {
                this.setUpAnalytics({
                    containerWidth: node && node.offsetWidth,
                    component: !this.props.isDropin ? (this.constructor['analyticsType'] ?? this.constructor['type']) : 'dropin',
                    flavor: !this.props.isDropin ? 'components' : 'dropin'
                }).then(() => {
                    // Once the initial analytics set up call has been made...
                    // ...create an analytics event  declaring that the component has been rendered
                    // (The dropin will do this itself from DropinComponent once the PM list has rendered)
                    if (!this.props.isDropin) {
                        const event = new AnalyticsInfoEvent({ type: ANALYTICS_RENDERED_STR });
                        this.submitAnalytics(event);
                    }
                });
            }
        }

        return this;
    }

    /**
     * Updates props, resets the internal state and remounts the element.
     *
     * @param props - props to update
     * @returns this - the element instance
     */
    public update(props: Partial<P>): this {
        this.props = this.formatProps({ ...this.props, ...props });
        this.state = {};

        return this.unmount().mount(this._node); // for new mount fny
    }

    /**
     * Unmounts a payment element from the DOM
     */
    public unmount(): this {
        // Remove listener
        off(this._node, 'keypress', this.handleKeyPress);

        if (this._node) {
            render(null, this._node);
        }

        return this;
    }

    /**
     * Unmounts an element and removes it from the parent instance
     * For "destroy" type cleanup - when you don't intend to use the component again
     */
    public remove() {
        this.unmount();

        if (this.core) {
            this.core.remove(this);
        }
    }
}

export default BaseElement;
