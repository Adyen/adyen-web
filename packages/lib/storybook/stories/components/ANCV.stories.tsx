import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { ANCVConfiguration } from '../../../src/components/ANCV/types';
import ANCV from '../../../src/components/ANCV/ANCV';
import { Checkout } from '../Checkout';

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
