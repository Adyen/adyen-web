import { MetaConfiguration, StoryConfiguration } from '../types';
import { OpenInvoiceConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import RatePayDirectDebit from '../../../src/components/RatePay/RatePayDirectDebit';
import { Checkout } from '../Checkout';

type RatePayDirectDebitStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'OpenInvoice/RatePayDirectDebit'
};

export const Default: RatePayDirectDebitStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new RatePayDirectDebit(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL'
    }
};

export default meta;
