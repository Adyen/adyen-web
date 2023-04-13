import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UPIElementProps } from '@adyen/adyen-web/dist/types/components/UPI/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type UpiStory = StoryObj<PaymentMethodStoryProps<UPIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UPIElementProps>> = {
    title: 'Components/UPI'
};
export default meta;

export const UPI: UpiStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const upi = checkout.create('upi', { ...args.componentConfiguration });
        upi.mount(container);
        addToWindow(upi);
        return container;
    },
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            // @ts-ignore Seems like enum isnt the best way to export fixed strings
            defaultMode: 'vpa'
        }
    }
};
