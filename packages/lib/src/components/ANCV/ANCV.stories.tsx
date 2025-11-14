import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { ANCVConfiguration } from './types';
import ANCV from './ANCV';
import { Checkout } from '../../../storybook/components/Checkout';

type ANCVStory = StoryObj<PaymentMethodStoryProps<ANCVConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<ANCVConfiguration>> = {
    title: 'Components/ANCV'
};

export const Default: ANCVStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new ANCV(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'NL',
        amount: 2000,
        useSessions: false
    }
};
export default meta;
