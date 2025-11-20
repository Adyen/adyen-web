import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Multibanco from './Multibanco';
import { VoucherConfiguration } from '../types';

type MultibancoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Components/Vouchers/Multibanco'
};

export const Default: MultibancoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Multibanco(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'PT'
    }
};

export default meta;
