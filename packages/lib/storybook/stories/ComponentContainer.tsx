import { useEffect, useRef, useState } from 'preact/hooks';
import UIElement from '../../src/components/internal/UIElement';

interface IContainer {
    element: UIElement;
}

export const ComponentContainer = ({ element }: IContainer) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!element) return;

        if (element.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    element.mount(container.current);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else {
            element.mount(container.current);
        }
    }, [element]);

    return <>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</>;
};
