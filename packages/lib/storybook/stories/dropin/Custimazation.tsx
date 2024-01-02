import { useEffect, useRef } from 'preact/hooks';
import './customization.scss';
import { AdyenCheckout, components, Dropin as DropinComponent } from '../../../src';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { PaymentMethodStoryProps } from '../types';
import { DropinConfiguration } from '../../../src/components/Dropin/types';

export const Custimazation = ({ args, context }) => {
    const container = useRef(null);

    useEffect(() => {
        if (!args || !context.loaded) return;

        const { componentConfiguration } = args;
        // Register all Components
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        const checkout = getStoryContextCheckout(context);
        const dropin = new DropinComponent({ core: checkout, ...componentConfiguration });
        dropin.mount(container.current);
    }, [args, context]);

    return (
        <div className={'dropin-customization'}>
            <div ref={container} id="component-root" className="component-wrapper" />
        </div>
    );
};
