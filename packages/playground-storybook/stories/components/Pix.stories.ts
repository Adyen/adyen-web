import { Meta, StoryFn } from '@storybook/html';
import { PixProps } from '@adyen/adyen-web/dist/types/components/Pix/types';
import { GlobalStoryProps } from '../types';
import { createCheckout } from '../../helpers/create-checkout';

type PixStoryProps = GlobalStoryProps & {
    componentConfiguration: PixProps;
};

export default {
    title: 'Components/Pix'
} as Meta;

const Template: StoryFn<PixStoryProps> = (props: PixStoryProps, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const pix = checkout.create('pix', { ...props.componentConfiguration });
    pix.mount(container);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PixStoryProps>;
Default.args = {
    countryCode: 'BR'
};
Default.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];

export const WithPersonalDetails = Template.bind({}) as StoryFn<PixStoryProps>;
WithPersonalDetails.args = {
    countryCode: 'BR',
    componentConfiguration: {
        personalDetailsRequired: true,
        // TODO: Make 'introduction' prop optional in PIX
        introduction: undefined
    }
};
WithPersonalDetails.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
