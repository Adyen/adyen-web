import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import EPS from './index';
import { IssuerListConfiguration } from '../types';

type EPSStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/EPS'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<IssuerListConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new EPS(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: EPSStory = {
    render,
    args: {
        countryCode: 'AT'
    }
};

export default meta;
