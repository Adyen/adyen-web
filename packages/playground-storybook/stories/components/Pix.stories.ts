import { Meta, StoryFn } from '@storybook/html';
import { PixProps } from '@adyen/adyen-web/dist/types/components/Pix/types';
import { PaymentMethodStoryProps } from '../types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

export default {
    title: 'Components/Pix'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<PixProps>> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const pix = checkout.create('pix', { ...props.componentConfiguration });
    pix.mount(container);
    addToWindow(pix);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<PixProps>>;
Default.args = {
    countryCode: 'BR'
};

export const WithPersonalDetails = Template.bind({}) as StoryFn<PaymentMethodStoryProps<PixProps>>;
WithPersonalDetails.args = {
    countryCode: 'BR',
    // @ts-ignore TODO: Make Pix 'introduction' prop optional
    componentConfiguration: {
        personalDetailsRequired: true
    }
};
