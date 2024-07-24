import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { GiftCardConfiguration } from '../../../src/components/Giftcard/types';
import { GiftcardExample } from './GiftcardExample';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Partial Payments/Givex(Giftcard) with Card'
};

export const Default: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: {
        countryCode: 'NL',
        amount: 20000,
        useSessions: false,
        componentConfiguration: {
            brand: 'givex'
        }
    }
};
export default meta;
