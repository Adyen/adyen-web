import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../../storybook/components/Checkout';
import { RedirectConfiguration } from '../types';
import RedirectElement from '..';

type RedirectStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Redirect'
};

export const Default: RedirectStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new RedirectElement(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL',
        componentConfiguration: { type: 'ideal' }
    }
};

export default meta;
