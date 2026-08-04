import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import UIElement from '../../src/components/internal/UIElement';
import { addToWindow } from '../utils/add-to-window';
import Spinner from '../../src/components/internal/Spinner';

interface IContainer {
    element: UIElement;
    id?: string;
}

export const ComponentContainer = ({ element, id = 'component-root' }: Readonly<IContainer>) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (!element) return;

        addToWindow(element);

        if (element.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    setIsAvailable(true);
                    if (container.current) {
                        element.mount(container.current);
                    }
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else {
            setIsAvailable(true);
            if (container.current) {
                element.mount(container.current);
            }
        }

        return () => {
            element.unmount();
        };
    }, [element]);

    return (
        <Fragment>
            {isAvailable ? null : (
                <div data-testid="checkout-component-spinner">
                    <Spinner />
                </div>
            )}
            {errorMessage ? (
                <div style={isAvailable ? {} : { display: 'none' }}>{errorMessage}</div>
            ) : (
                <div ref={container} style={isAvailable ? {} : { display: 'none' }} id={id} className="component-wrapper" />
            )}
        </Fragment>
    );
};
