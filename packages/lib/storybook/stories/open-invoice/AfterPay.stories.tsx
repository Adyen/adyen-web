import { MetaConfiguration, StoryConfiguration } from '../types';
import { OpenInvoiceConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import AfterPay from '../../../src/components/AfterPay/AfterPay';
import { Checkout } from '../Checkout';

type AfterPayStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'OpenInvoice/AfterPay'
};

export const Default: AfterPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new AfterPay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL'
    }
};

export default meta;
