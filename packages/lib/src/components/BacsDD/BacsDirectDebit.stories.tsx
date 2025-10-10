import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { VoucherConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import BacsDirectDebit from './BacsDD';
import { Checkout } from '../../../storybook/components/Checkout';

type BacsDirectDebitStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Components/Vouchers/BacsDirectDebit'
};

export const Default: BacsDirectDebitStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new BacsDirectDebit(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        countryCode: 'GB'
    }
};

export default meta;
