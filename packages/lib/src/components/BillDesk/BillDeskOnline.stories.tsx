import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import BillDeskOnline from './BillDeskOnline';
import { IssuerListConfiguration } from '../types';

type BillDeskOnlineStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/BillDeskOnline'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<IssuerListConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new BillDeskOnline(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: BillDeskOnlineStory = {
    render,
    args: {
        countryCode: 'IN'
    }
};

export default meta;
