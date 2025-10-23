import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Sepa from './Sepa';
import { SepaConfiguration } from './types';

type SepaStory = StoryConfiguration<SepaConfiguration>;

const meta: MetaConfiguration<SepaConfiguration> = {
    title: 'Components/Sepa'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<SepaConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Sepa(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: SepaStory = {
    render,
    args: {
        countryCode: 'NL'
    }
};

export default meta;
