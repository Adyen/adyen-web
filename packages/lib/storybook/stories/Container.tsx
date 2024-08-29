import { useEffect, useRef, useState } from 'preact/hooks';
import { createCheckout } from '../helpers/create-checkout';
import UIElement from '../../src/components/internal/UIElement';
import { GlobalStoryProps } from './types';
import { UIElementProps } from '../../src/components/internal/UIElement/types';
import { ICore } from '../../src/core/types';

type ComponentConfig = UIElementProps & { [key: string]: any };
type UIElementConstructor<T extends UIElement> = new (core: ICore, props?: ComponentConfig) => T;

interface IContainer<T extends UIElement> {
    Element: UIElementConstructor<T>;
    checkoutConfig: GlobalStoryProps;
    componentConfig?: ComponentConfig;
}

export const Container = <T extends UIElement>({ Element, checkoutConfig, componentConfig }: IContainer<T>) => {
    const container = useRef(null);
    const [adyenCheckout, setAdyenCheckout] = useState<ICore>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        createCheckout(checkoutConfig)
            .then(checkout => {
                setAdyenCheckout(checkout);
            })
            .catch(() => {
                setErrorMessage('Initialize checkout failed.');
            });
    }, [checkoutConfig]);

    useEffect(() => {
        if (!Element || !adyenCheckout) return;

        const instance = new Element(adyenCheckout, componentConfig);
        if (instance.isAvailable) {
            instance
                .isAvailable()
                .then(() => {
                    instance.mount(container.current as unknown as HTMLElement);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else {
            instance.mount(container.current as unknown as HTMLElement);
        }

        return () => {
            instance.unmount();
        };
    }, [Element, adyenCheckout]);

    return <>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</>;
};
