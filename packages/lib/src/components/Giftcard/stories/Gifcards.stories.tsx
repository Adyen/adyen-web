import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { GiftCardConfiguration } from '../types';
import { GiftcardExample } from './GiftcardExample';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Components/Partial Payments/Givex(Giftcard)'
};

export const withCard: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: {
        countryCode: 'NL',
        useSessions: true,
        srConfig: { showPanel: false, moveFocus: true },
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
        srConfig: { showPanel: false, moveFocus: true },
        componentConfiguration: {
            brand: 'givex'
        }
    }
};

export default meta;
