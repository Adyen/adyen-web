import { MetaConfiguration, StoryConfiguration } from '../types';
import { VoucherConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import BacsDirectDebit from '../../../src/components/BacsDD/BacsDD';
import { Checkout } from '../Checkout';

type BacsDirectDebitStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Vouchers/BacsDirectDebit'
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
