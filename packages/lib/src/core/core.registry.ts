import UIElement from '../components/UIElement';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

function createComponentsMap(components: (new (props) => UIElement)[]) {
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

        return memo;
    }, {});
}

export interface IRegistry {
    add(...items: (new (props) => UIElement)[]): void;
    getComponent(type: string): new (props) => UIElement;
}

class Registry implements IRegistry {
    public components: (new (props) => UIElement)[] = [];
    public componentsMap: Record<string, new (props) => UIElement> = {};

    public add<T extends UIElement>(...items: (new (props) => T)[]) {
        this.components = [...items];
        this.componentsMap = createComponentsMap(this.components);
    }

    public getComponent(type: string) {
        return this.componentsMap[type];
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
