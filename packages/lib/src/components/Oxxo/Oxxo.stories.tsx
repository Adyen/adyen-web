import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { VoucherConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import Oxxo from '.';
import { Checkout } from '../../../storybook/components/Checkout';

type OxxoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Components/Vouchers/Oxxo'
};

export const Default: OxxoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Oxxo(checkout, componentConfiguration)} />}</Checkout>
    ),

    args: {
        countryCode: 'MX'
    }
};

export default meta;
