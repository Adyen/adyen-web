import { IUIElement } from '@adyen/adyen-web/dist/types/components/types';

const addToWindow = (component: IUIElement) => {
    // @ts-ignore
    window.component = component;
};

export { addToWindow };
