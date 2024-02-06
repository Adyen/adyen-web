import { useEffect, useRef, useState } from 'preact/hooks';
import { IUIElement } from '../../src/components/internal/UIElement/types';

interface IContainer {
    element: IUIElement;
}

export const Container = ({ element }: IContainer) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
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
    }, []);

    return <div>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</div>;
};
