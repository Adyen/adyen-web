import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import { RedirectConfiguration } from '../../../src/components/Redirect/types';
import RedirectElement from '../../../src/components/Redirect';

type IdealStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Ideal'
};

export const Default: IdealStory = {
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
