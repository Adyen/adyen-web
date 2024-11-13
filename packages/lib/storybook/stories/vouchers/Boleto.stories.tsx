import { MetaConfiguration, StoryConfiguration } from '../types';
import { VoucherConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import Boleto from '../../../src/components/Boleto';
import { Checkout } from '../Checkout';

type BoletoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Vouchers/Boleto'
};

export const Default: BoletoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Boleto(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        countryCode: 'BR'
    }
};

export default meta;
