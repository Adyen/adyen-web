import React from 'react';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';
import ClickToPay from '../../../src/components/ClickToPay';

import type { MetaConfiguration, StoryConfiguration } from '../types';
import type { ClickToPayConfiguration } from '../../../src/components/ClickToPay/types';

type ClickToPayStory = StoryConfiguration<ClickToPayConfiguration>;

const meta: MetaConfiguration<ClickToPayConfiguration> = {
    title: 'Components/ClickToPay'
};

export const StandaloneComponent: ClickToPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new ClickToPay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            shopperEmail: 'guilherme.ribeiro+ctp10@adyen.com',
            merchantDisplayName: 'Adyen Merchant Name',
            onChange(state, component) {
                console.log(state, component);
            }
        }
    }
};

export default meta;
