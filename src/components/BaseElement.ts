import { render } from 'preact';
import getProp from '~/utils/getProp';
import EventEmitter from './EventEmitter';

abstract class BaseElement {
    public props;
    public _node;
    public state;
    public _component;
    public eventEmitter = new EventEmitter();

    protected constructor(props = {}) {
        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...props });
        this._node = null;
        this.state = {};
    }

    protected static defaultProps = {};

    /**
     * Executed during creation of any payment element.
     * Gives a chance to any paymentMethod to format the props we're receiving.
     */
    protected formatProps(props) {
        return props;
    }

    /**
     * Executed on the `data` getter.
     * Returns the component data necessary for the /payments request
     */
    protected formatData() {
        return {};
    }

    protected setState(newState: object): void {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Returns the component payment data ready to submit to the Checkout API
     * Note: this does not ensure validity, check isValid first
     */
    get data(): any {
        const clientData = getProp(this.props, 'modules.risk.data');
        const conversionId = getProp(this.props, 'modules.analytics.conversionId');

        return {
            ...(clientData && { riskData: { clientData } }),
            ...(conversionId && { conversionId }),
            ...this.formatData()
        };
    }

    protected render() {
        // render() not implemented in the element
        throw new Error('Payment method cannot be rendered.');
    }

    /**
     * Mounts an element into the dom
     * @param domNode - Node (or selector) where we will mount the payment element
     * @returns this - the payment element instance we mounted
     */
    public mount(domNode: HTMLElement | string): BaseElement {
        const node = typeof domNode === 'string' ? document.querySelector(domNode) : domNode;

        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }

        if (this._node) {
            throw new Error('Component is already mounted.');
        }

        this._node = node;
        this._component = this.render();

        render(this._component, node);

        if (this.props.modules && this.props.modules.analytics && !this.props.isDropin) {
            this.props.modules.analytics.send({
                containerWidth: this._node && this._node.offsetWidth,
                component: this.constructor['type'],
                flavor: 'components'
            });
        }

        return this;
    }

    public remount(component): BaseElement {
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
    public unmount(): void {
        if (this._node) {
            render(null, this._node);
        }
    }
}

export default BaseElement;
