import { ComponentChild, render } from 'preact';
import getProp from '../utils/getProp';
import EventEmitter from './EventEmitter';
import uuid from '../utils/uuid';
import { BaseElementProps, PaymentData } from './types';
import { RiskData } from '../core/RiskModule/RiskModule';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';
import { ICore } from '../core/types';

class BaseElement<P extends BaseElementProps> {
    public readonly _id = `${this.constructor['type']}-${uuid()}`;
    public props: P;
    public state: any = {};
    protected static defaultProps = {};
    public _node = null;
    public _component;
    public eventEmitter = new EventEmitter();
    protected readonly core: ICore;

    protected constructor(props: P) {
        this.core = props.core;

        if (!this.core) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                `Trying to initialise the component '${this.constructor['type']}' without a reference to an instance of Checkout ('core' prop)`
            );
        }

        this.buildElementProps(props);
    }

    protected buildElementProps(componentProps: P) {
        const { core, ...rest } = componentProps;
        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...rest });
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
     *
     * TODO: Replace 'any' by type PaymentMethodData<T> - this change requires updating all payment methods,
     *       properly adding the type of the formatData function
     */
    protected formatData(): any {
        return {};
    }

    protected setState(newState: object): void {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Returns the component payment data ready to submit to the Checkout API
     * Note: this does not ensure validity, check isValid first
     */
    get data(): PaymentData {
        const clientData = getProp(this.props, 'modules.risk.data');
        const useAnalytics = !!getProp(this.props, 'modules.analytics.props.enabled');
        const checkoutAttemptId = useAnalytics ? getProp(this.props, 'modules.analytics.checkoutAttemptId') : 'do-not-track';
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
        const node = typeof domNode === 'string' ? document.querySelector(domNode) : domNode;

        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }

        if (this._node) {
            this.unmount(); // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        } else {
            // Set up analytics, once
            if (this.props.modules && this.props.modules.analytics && !this.props.isDropin) {
                this.props.modules.analytics.send({
                    containerWidth: this._node && this._node.offsetWidth,
                    component: this.constructor['analyticsType'] ?? this.constructor['type'],
                    flavor: 'components'
                });
            }
        }

        this._node = node;
        this._component = this.render();

        render(this._component, node);

        return this;
    }

    /**
     * Updates props, resets the internal state and remounts the element.
     * @param props - props to update
     * @returns this - the element instance
     */
    public update(props: P): this {
        this.buildElementProps({ ...this.props, ...props });
        this.state = {};

        return this.unmount().mount(this._node); // for new mount fny
    }

    /**
     * Unmounts an element and mounts it again on the same node i.e. allows mount w/o having to pass a node.
     * Should be "private" & undocumented (although being a public function is useful for testing).
     * Left in for legacy reasons
     */
    public remount(component?): this {
        if (!this._node) {
            throw new Error('Component is not mounted.');
        }

        const newComponent = component || this.render();

        render(newComponent, this._node, null);

        return this;
    }

    /**
     * Unmounts a payment element from the DOM
     */
    public unmount(): this {
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
