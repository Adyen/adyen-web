import React from 'react';
import { AdyenCheckout, components } from '../../../src';
// use direct imports
import Ach from '../../../src/components/Ach';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';

import type { MetaConfiguration, StoryConfiguration } from '../types';
import type { AchConfiguration } from '../../../src/components/Ach/types';

type ACHStory = StoryConfiguration<AchConfiguration>;

const meta: MetaConfiguration<AchConfiguration> = {
    title: 'Components/ACH'
};

export const Default: ACHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Ach(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'US',
        componentConfiguration: {
            onChange(data) {
                console.log(data);
            }
        }
    }
};

export const WithDropin: ACHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const { Dropin, Ach } = components;
        AdyenCheckout.register(Ach);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new Dropin(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export default meta;
