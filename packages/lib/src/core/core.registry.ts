import UIElement from '../components/UIElement';
import Redirect from '../components/Redirect/Redirect';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

export type NewableComponent = new (props) => UIElement;

const actionElements = {
    redirect: Redirect
};

function createComponentsMap(components: NewableComponent[]) {
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
        ...actionElements
    };
}

export interface IRegistry {
    add(...items: NewableComponent[]): void;
    getComponent(type: string): NewableComponent;
}

class Registry implements IRegistry {
    public componentsMap: Record<string, NewableComponent> = {};

    public add(...items: NewableComponent[]) {
        this.componentsMap = createComponentsMap(items);
        console.log('### core.registry:::: componentsMap', this.componentsMap);
    }

    public getComponent(type: string) {
        return this.componentsMap[type];
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
