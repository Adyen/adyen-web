import React from 'react';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';

import { AdyenCheckout } from '../../../src/core/AdyenCheckout';
import Dropin from '../../../src/components/Dropin';
import PreAuthorizedDebitCanada from '../../../src/components/PreAuthorizedDebitCanada';

import type { MetaConfiguration, StoryConfiguration } from '../types';
import type { PreAuthorizedDebitCanadaConfiguration } from '../../../src/components/PreAuthorizedDebitCanada/types';

type PreAuthorizedDebitCanadaStory = StoryConfiguration<PreAuthorizedDebitCanadaConfiguration>;

const meta: MetaConfiguration<PreAuthorizedDebitCanadaConfiguration> = {
    title: 'Components/PreAuthorizedDebitCanada'
};

export const Default: PreAuthorizedDebitCanadaStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PreAuthorizedDebitCanada(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'CA'
        // componentConfiguration: {
        //     // enableStoreDetails: false
        // }
    }
};

export const WithDropin: PreAuthorizedDebitCanadaStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        AdyenCheckout.register(PreAuthorizedDebitCanada);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new Dropin(checkout, componentConfiguration)} />}
            </Checkout>
        );
    },
    args: {
        countryCode: 'CA'
    }
};

export default meta;
