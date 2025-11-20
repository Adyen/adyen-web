import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { IssuerListConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import PayByBank from './PayByBank';

type PayByBankStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/PayByBank'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<IssuerListConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new PayByBank(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: PayByBankStory = {
    render,
    args: {
        countryCode: 'GB'
    }
};

export default meta;
