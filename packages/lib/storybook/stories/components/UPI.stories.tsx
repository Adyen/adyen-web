import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UPIElementProps } from '../../../src/components/UPI/types';
import { Container } from '../Container';

type UpiStory = StoryObj<PaymentMethodStoryProps<UPIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UPIElementProps>> = {
    title: 'Components/UPI'
};
export default meta;

export const UPI: UpiStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'upi'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'IN',
        // @ts-ignore Seems like enum isnt the best way to export fixed strings
        componentConfiguration: {
            //defaultMode: 'upi_intent'
            appIds: [
                {
                    id: 'bhim',
                    name: 'BHIM'
                },
                {
                    id: 'gpay',
                    name: 'Google Pay'
                },
                {
                    id: 'PhonePe',
                    name: 'Phone Pe'
                }
            ]
        }
    }
};
