import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export const Container = ({ type, componentConfiguration, checkout }) => {
    const container = useRef(null);

    useEffect(() => {
        if (!checkout) {
            return;
        }
        checkout.create(type, { ...componentConfiguration }).mount(container.current);
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
