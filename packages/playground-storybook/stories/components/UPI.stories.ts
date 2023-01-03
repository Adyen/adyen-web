import { Meta, StoryFn } from '@storybook/html';
import { GlobalStoryProps } from '../types';
import { UPIElementProps } from '@adyen/adyen-web/dist/types/components/UPI/types';
import { createCheckout } from '../../helpers/create-checkout';

type UPIStoryProps = GlobalStoryProps & {
    componentConfiguration: UPIElementProps;
};

export default {
    title: 'Components/UPI'
} as Meta;

export const UPI: StoryFn<UPIStoryProps> = (props: UPIStoryProps, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const upi = checkout.create('upi', { ...props.componentConfiguration });
    upi.mount(container);
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
