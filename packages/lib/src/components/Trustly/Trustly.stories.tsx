import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { RedirectConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Trustly from './Trustly';

type TrustlyStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Trustly'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Trustly(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: TrustlyStory = {
    render,
    args: {
        countryCode: 'DE'
    }
};

export default meta;
