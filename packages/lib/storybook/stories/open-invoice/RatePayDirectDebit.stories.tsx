import { MetaConfiguration, StoryConfiguration } from '../types';
import { OpenInvoiceConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import { RatePay } from '../../../src';

type RatePayDirectDebitStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'OpenInvoice/RatePayDirectDebit'
};

export const Default: RatePayDirectDebitStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new RatePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL',
        componentConfiguration: { onChange: state => console.log({ state }) }
    }
};

export default meta;
