import UIElement from '../components/UIElement';

class Registry {
    public components: (typeof UIElement)[] = [];

    // constructor() {}

    public add(...items: (typeof UIElement)[]) {
        this.components = [...this.components, ...items];
    }

    public getComponent(type: string) {
        const componentsMap = this.components.reduce((memo, component) => {
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
