import UIElement from '../components/UIElement';
import { ThreeDS2Challenge, ThreeDS2DeviceFingerprint, Redirect } from '../components';
import { TxVariants } from '../components/tx-variants';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

export type NewableComponent = new (props) => UIElement;

export interface IRegistry {
    add(...items: NewableComponent[]): void;
    getComponent(type: string): NewableComponent | undefined;
}

const defaultComponents = {
    [TxVariants.redirect]: Redirect,
    [TxVariants.threeDS2Challenge]: ThreeDS2Challenge,
    [TxVariants.threeDS2DeviceFingerprint]: ThreeDS2DeviceFingerprint
};

class Registry implements IRegistry {
    public componentsMap: Record<string, NewableComponent> = defaultComponents;

    public supportedTxVariants: Set<string> = new Set(Object.values(TxVariants));

    public add(...items: NewableComponent[]) {
        this.componentsMap = {
            ...this.componentsMap,
            ...this.createComponentsMap(items)
        };
    }

    public getComponent(type: string): NewableComponent | undefined {
        const Component = this.componentsMap[type];
        if (Component) {
            return Component;
        }

        if (this.supportedTxVariants.has(type)) {
            console.warn(`CoreRegistry: The component of '${type}' is supported, but it is not registered internally.`);
            return;
        }

        return Redirect;
    }

    public createComponentsMap(components: NewableComponent[]) {
        const componentsMap = components.reduce((memo, component) => {
            const isValid = assertIsTypeofUIElement(component);
            if (!isValid) {
                return memo;
            }

            const supportedTxVariants = [component.type, ...component.txVariants].filter(txVariant => txVariant);

            supportedTxVariants.forEach(txVariant => {
                memo = {
                    ...memo,
                    [txVariant]: component
                };
            });

            return memo;
        }, {});

        return componentsMap;
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
