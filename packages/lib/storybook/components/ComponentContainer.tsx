import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import UIElement from '../../src/components/internal/UIElement';
import { addToWindow } from '../utils/add-to-window';

interface IContainer {
    element: UIElement;
}

export const ComponentContainer = ({ element }: IContainer) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!element) return;

        addToWindow(element);

        if (element.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    if (container.current) {
                        element.mount(container.current);
                    }
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else {
            if (container.current) {
                element.mount(container.current);
            }
}

        return () => {
            element.unmount();
        };
    }, [element]);

    return <Fragment>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</Fragment>;
};
