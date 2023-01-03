import { Meta, StoryFn } from '@storybook/html';
import { GlobalStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';

type OxxoStoryProps = GlobalStoryProps & {
    componentConfiguration: UIElementProps;
};

export default {
    title: 'Vouchers/Oxxo'
} as Meta;

export const Oxxo: StoryFn<OxxoStoryProps> = (props: OxxoStoryProps, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const oxxo = checkout.create('oxxo');
    oxxo.mount(container);
    return container;
};

Oxxo.args = {
    countryCode: 'MX'
};

Oxxo.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
