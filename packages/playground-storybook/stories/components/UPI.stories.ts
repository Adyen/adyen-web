import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UPIElementProps } from '@adyen/adyen-web/dist/types/components/UPI/types';
import { createCheckout } from '../../helpers/create-checkout';
import { addToWindow } from '../../utils/add-to-window';

export default {
    title: 'Components/UPI'
} as Meta;

export const UPI: StoryFn<PaymentMethodStoryProps<UPIElementProps>> = (
    props: PaymentMethodStoryProps<UPIElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const upi = checkout.create('upi', { ...props.componentConfiguration });
    upi.mount(container);
    addToWindow(upi);
    return container;
};

UPI.args = {
    countryCode: 'IN',
    componentConfiguration: {
        // @ts-ignore Seems like enum isnt the best way to export fixed strings
        defaultMode: 'vpa'
    }
};

UPI.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
