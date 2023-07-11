import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Core from '../../src/core';
import { PaymentMethodOptions, PaymentMethods } from '../../src/types';

interface IContainer<T extends keyof PaymentMethods> {
    type: T;
    componentConfiguration: PaymentMethodOptions<T>;
    checkout: Core;
}

export const Container = <T extends keyof PaymentMethods>({ type, componentConfiguration, checkout }: IContainer<T>) => {
    const container = useRef(null);

    useEffect(() => {
        if (!checkout) {
            return;
        }
        checkout.create(type, { ...componentConfiguration }).mount(container.current);
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
