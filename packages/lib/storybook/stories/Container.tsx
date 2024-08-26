import { Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import Core from '../../src/core';
import { PaymentMethodOptions, PaymentMethods } from '../../src/types';

interface IContainer<T extends keyof PaymentMethods> {
    type: T;
    componentConfiguration: PaymentMethodOptions<T>;
    checkout: Core;
}

export const Container = <T extends keyof PaymentMethods>({ type, componentConfiguration, checkout }: IContainer<T>) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!checkout) {
            return;
        }

        const element = checkout.create(type, { ...componentConfiguration });
        window[type] = element;

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

    return (
        <Fragment>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</Fragment>
    );
};
