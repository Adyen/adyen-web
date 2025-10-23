import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { RedirectConfiguration } from '../../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import PayByBankUS from './PayByBankUS';

type PayByBankUSStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/PayByBankUS'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new PayByBankUS(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: PayByBankUSStory = {
    render,
    args: {
        countryCode: 'US'
    }
};

export default meta;
