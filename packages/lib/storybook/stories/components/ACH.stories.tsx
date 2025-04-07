import React from 'react';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';

import { AdyenCheckout } from '../../../src/core/AdyenCheckout';
import Dropin from '../../../src/components/Dropin';
import Ach from '../../../src/components/Ach';

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
        componentConfiguration: {}
    }
};

export const WithDropin: ACHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        AdyenCheckout.register(Ach);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new Dropin(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export default meta;
