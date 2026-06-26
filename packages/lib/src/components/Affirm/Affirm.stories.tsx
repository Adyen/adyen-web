import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Affirm from './Affirm';
import type { AffirmConfiguration } from './types';

type AffirmStory = StoryConfiguration<AffirmConfiguration>;

const meta: MetaConfiguration<AffirmConfiguration> = {
    title: 'Components/Affirm'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<AffirmConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Affirm(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: AffirmStory = {
    render,
    args: {
        countryCode: 'US',
        componentConfiguration: {
            allowedCountries: ['CA', 'US']
        }
    }
};

export default meta;
