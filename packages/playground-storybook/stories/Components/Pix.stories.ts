import { Meta, StoryFn } from '@storybook/html';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { PixProps } from '@adyen/adyen-web/dist/types/components/Pix/types';
import { GlobalArgs } from '../types';

type PixStoryProps = GlobalArgs & {
    componentConfiguration: PixProps;
};

export default {
    title: 'Components/Pix'
} as Meta;

export const Pix: StoryFn<PixStoryProps> = (props: PixStoryProps, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const pix = checkout.create('pix', { ...props.componentConfiguration });
    pix.mount(container);
    return container;
};

Pix.args = {
    countryCode: 'BR',
    componentConfiguration: {
        personalDetailsRequired: false
    }
};

Pix.loaders = [
    async context => {
        debugger;
        const { useSessions, paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount } = context.args;
        const checkout = useSessions
            ? await createSessionsCheckout({ showPayButton, paymentMethodsConfiguration, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({ paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount });
        return { checkout };
    }
];
