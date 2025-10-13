import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import RatePayDirectDebit from './RatePayDirectDebit';
import { Checkout } from '../../../storybook/components/Checkout';

type RatePayDirectDebitStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/RatePayDirectDebit'
};

export const Default: RatePayDirectDebitStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new RatePayDirectDebit(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'DE'
    }
};

export default meta;
