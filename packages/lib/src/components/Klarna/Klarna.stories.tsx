import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { KlarnaConfiguration } from './types';
import Klarna from './KlarnaPayments';
import { Checkout } from '../../../storybook/components/Checkout';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';

type KlarnaStory = StoryConfiguration<KlarnaConfiguration>;

const meta: MetaConfiguration<KlarnaConfiguration> = {
    title: 'Components/Klarna'
};

export const Widget: KlarnaStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Klarna(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        countryCode: COUNTRY_CODES.Netherlands,
        componentConfiguration: { useKlarnaWidget: true }
    }
};

export const B2b: KlarnaStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Klarna(checkout, { ...componentConfiguration, type: 'klarna_b2b' })} />}
        </Checkout>
    ),

    args: {
        countryCode: COUNTRY_CODES.Sweden,
        componentConfiguration: {}
    }
};

export default meta;
