import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { GiftCardConfiguration } from '../types';
import { GiftcardExample } from './GiftcardExample';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Components/Gift Cards/SVS'
};

// Base story args
const baseArgs = {
    countryCode: 'VN',
    useSessions: true,
    srConfig: { showPanel: false, moveFocus: true },
    componentConfiguration: {
        brand: 'svs'
    }
};

export const Default: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: baseArgs
};

export default meta;
