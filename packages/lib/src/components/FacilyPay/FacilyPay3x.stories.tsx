import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import FacilyPay3x from './FacilyPay3x';
import { Checkout } from '../../../storybook/components/Checkout';

type FacilyPay3xStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/FacilyPay3x'
};

export const Default: FacilyPay3xStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new FacilyPay3x(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'FR'
    }
};

export default meta;
