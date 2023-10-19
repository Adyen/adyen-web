import { IUIElement } from '../../src/components/types';

const addToWindow = (component: IUIElement) => {
    // @ts-ignore ignore
    window.component = component;
};

export { addToWindow };
