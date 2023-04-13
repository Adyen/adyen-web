import { Meta, StoryObj } from '@storybook/html';
import { PixProps } from '@adyen/adyen-web/dist/types/components/Pix/types';
import { PaymentMethodStoryProps } from '../types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type PixStory = StoryObj<PaymentMethodStoryProps<PixProps>>;

const meta: Meta<PaymentMethodStoryProps<PixProps>> = {
    title: 'Components/Pix'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const pix = checkout.create('pix', { ...args.componentConfiguration });
    pix.mount(container);
    addToWindow(pix);
    return container;
};

export const Default: PixStory = {
    render: createComponent,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render: createComponent,
    args: {
        ...Default.args,
        // @ts-ignore TODO: Make Pix 'introduction' prop optional
        componentConfiguration: {
            personalDetailsRequired: true
        }
    }
};
