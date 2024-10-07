import { UIElement } from '../../src/types';

const addToWindow = (component: UIElement) => {
    globalThis.component = component;
    globalThis.parent.window['component'] = component;
};

export { addToWindow };
