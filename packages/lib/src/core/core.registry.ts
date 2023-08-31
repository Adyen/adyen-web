import UIElement from '../components/UIElement';
import Redirect from '../components/Redirect/Redirect';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

export type NewableComponent = new (props) => UIElement;

export interface IRegistry {
    add(...items: NewableComponent[]): void;
    getComponent(type: string): NewableComponent;
}

class Registry implements IRegistry {
    public componentsMap: Record<string, NewableComponent> = {};

    public add(...items: NewableComponent[]) {
        this.componentsMap = this.createComponentsMap(items);
    }

    public getComponent(type: string) {
        return this.componentsMap[type];
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

            component.dependencies.forEach(dependency => {
                memo = {
                    ...memo,
                    [dependency.type]: dependency
                };
            });
            return memo;
        }, {});

        return {
            ...componentsMap,
            redirect: Redirect
        };
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
