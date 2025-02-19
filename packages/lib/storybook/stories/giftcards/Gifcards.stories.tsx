import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { GiftCardConfiguration } from '../../../src/components/Giftcard/types';
import { GiftcardExample } from './GiftcardExample';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Partial Payments/Givex(Giftcard)'
};

export const withCard: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: {
        countryCode: 'NL',
        useSessions: true,
        componentConfiguration: {
            brand: 'givex'
        }
    }
};

export const withGiftCard: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} renderCard={false} />;
    },
    args: {
        countryCode: 'NL',
        useSessions: true,
        componentConfiguration: {
            brand: 'givex'
        }
    }
};

export default meta;
