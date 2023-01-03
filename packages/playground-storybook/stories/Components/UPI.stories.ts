import { Meta, StoryFn } from '@storybook/html';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { GlobalArgs } from '../types';
import { UPIElementProps } from '@adyen/adyen-web/dist/types/components/UPI/types';

type UPIStoryProps = GlobalArgs & {
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
        const { useSessions, paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount } = context.args;
        const checkout = useSessions
            ? await createSessionsCheckout({ showPayButton, paymentMethodsConfiguration, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({ paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount });
        return { checkout };
    }
];
