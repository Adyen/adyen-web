import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import FacilyPay4x from './FacilyPay4x';
import { Checkout } from '../../../storybook/components/Checkout';

type FacilyPay4xStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/FacilyPay4x'
};

export const Default: FacilyPay4xStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new FacilyPay4x(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'FR'
    }
};

export default meta;
