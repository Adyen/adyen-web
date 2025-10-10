import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import RatePay from './RatePay';
import { Checkout } from '../../../storybook/components/Checkout';

type RatePayStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/RatePay'
};

export const Default: RatePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new RatePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL'
    }
};

export default meta;
