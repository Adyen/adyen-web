import UIElement from '../components/internal/UIElement/UIElement';
import ThreeDS2Challenge from '../components/ThreeDS2/ThreeDS2Challenge';
import ThreeDS2DeviceFingerprint from '../components/ThreeDS2/ThreeDS2DeviceFingerprint';
import Redirect from '../components/Redirect';
import { TxVariants } from '../components/tx-variants';
import type { ICore } from './types';
import type { IUIElement } from '../components/internal/UIElement/types';

function assertClassHasType(Class: any): Class is typeof UIElement {
    const hasValidType = typeof Class.type === 'string' && !!Class.type;
    return hasValidType;
}

export type NewableComponent = new (checkout: ICore, props?) => IUIElement;

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
            return;
        }

        return Redirect;
    }

    public createComponentsMap(components: NewableComponent[]) {
        const componentsMap = components.reduce((memo, component) => {
            const isValid = assertClassHasType(component);

            if (!isValid) {
                console.error('CoreRegistry: Attempt to register Class failed. The Class is not a valid UIElement');
                return memo;
            }
            if (component.type === 'dropin') {
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

export default new Registry();
