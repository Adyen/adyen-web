import { MetaConfiguration, StoryConfiguration } from '../types';
import { VoucherConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import Oxxo from '../../../src/components/Oxxo';
import { Checkout } from '../Checkout';

type OxxoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Vouchers/Oxxo'
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
