import { Meta, StoryFn } from '@storybook/html';
import { GlobalStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';

type IdealStoryProps = GlobalStoryProps & {
    // TODO: iDeal does not export types (ex: to use highlightedIssuers )
    componentConfiguration: UIElementProps;
};

export default {
    title: 'IssuerLists/IDEAL'
} as Meta;

const Template: StoryFn<IdealStoryProps> = (props: IdealStoryProps, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const ideal = checkout.create('ideal', { ...props.componentConfiguration });
    ideal.mount(container);
    return container;
};

export const Default = Template.bind({}) as StoryFn<IdealStoryProps>;
Default.args = {
    countryCode: 'NL'
};
Default.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];

export const WithHighlightedIssuers = Template.bind({}) as StoryFn<IdealStoryProps>;
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
