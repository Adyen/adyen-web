import UIElement from '../components/UIElement';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

export type NewableComponent = new (checkout, props) => UIElement;

function createComponentsMap(components: NewableComponent[]) {
    return components.reduce((memo, component) => {
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
        // console.log('### core.registry:::: memo', memo);
        return memo;
    }, {});
}

export interface IRegistry {
    add(...items: NewableComponent[]): void;
    getComponent(type: string): NewableComponent;
}

class Registry implements IRegistry {
    public components: NewableComponent[] = [];
    public componentsMap: Record<string, NewableComponent> = {};

    public add(...items: NewableComponent[]) {
        this.components = [...items];
        this.componentsMap = createComponentsMap(this.components);
    }

    public getComponent(type: string) {
        return this.componentsMap[type];
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
