import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import FacilyPay12x from './FacilyPay12x';
import { Checkout } from '../../../storybook/components/Checkout';

type FacilyPay12xStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/FacilyPay12x'
};

export const Default: FacilyPay12xStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new FacilyPay12x(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'FR'
    }
};

export default meta;
