import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';
import { addToWindow } from '../../utils/add-to-window';

export default {
    title: 'IssuerLists/IDEAL'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (
    props: PaymentMethodStoryProps<UIElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const ideal = checkout.create('ideal', { ...props.componentConfiguration });
    ideal.mount(container);
    addToWindow(ideal);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
Default.args = {
    countryCode: 'NL'
};
Default.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];

export const WithHighlightedIssuers = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
WithHighlightedIssuers.args = {
    countryCode: 'NL',
    componentConfiguration: {
        // @ts-ignore TODO: 'highlightedIssuers' is not documented
        highlightedIssuers: ['1121', '1154', '1153']
    }
};
WithHighlightedIssuers.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
