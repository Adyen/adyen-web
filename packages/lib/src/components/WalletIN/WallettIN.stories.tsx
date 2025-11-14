import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import { IssuerListConfiguration } from '../types';
import WalletIN from './index';

type WalletINStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/WalletIN'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<IssuerListConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new WalletIN(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: WalletINStory = {
    render,
    args: {
        countryCode: 'IN'
    }
};

export default meta;
