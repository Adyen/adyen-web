import UIElement from '../components/UIElement';

function assertIsTypeofUIElement(item: any): item is typeof UIElement {
    return typeof UIElement === typeof item;
}

class Registry {
    public components: (new (props) => UIElement)[] = [];

    public add<T extends UIElement>(...items: (new (props) => T)[]) {
        this.components = [...items];
    }

    public getComponent(type: string) {
        const componentsMap = this.components.reduce((memo, component) => {
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

        console.log(componentsMap);

        return componentsMap[type];
    }
}

// singleton instance
export default /* #__PURE__ */ new Registry();
