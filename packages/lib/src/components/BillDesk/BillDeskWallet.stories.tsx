import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import BillDeskWallet from './BillDeskWallet';
import { IssuerListConfiguration } from '../types';

type BillDeskWalletStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/BillDeskWallet'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<IssuerListConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new BillDeskWallet(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: BillDeskWalletStory = {
    render,
    args: {
        countryCode: 'IN'
    }
};

export default meta;
