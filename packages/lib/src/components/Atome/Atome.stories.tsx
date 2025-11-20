import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Atome from './Atome';
import { OpenInvoiceConfiguration } from '../types';

type AtomeStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/Atome'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<OpenInvoiceConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Atome(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: AtomeStory = {
    render,
    args: {
        countryCode: 'SG'
    }
};

export default meta;
