import React from 'react';
import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { KlarnaConfiguration } from '../../../src/components/Klarna/types';
import Klarna from '../../../src/components/Klarna/KlarnaPayments';
import { Checkout } from '../Checkout';

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
        countryCode: 'NL',
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
        countryCode: 'NL',
        componentConfiguration: {}
    }
};

export default meta;
