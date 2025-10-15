import { h } from 'preact';
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';

import { AdyenCheckout } from '../../core/AdyenCheckout';
import Dropin from '../Dropin';
import PreAuthorizedDebitCanada from './PreAuthorizedDebitCanada';

import type { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import type { PreAuthorizedDebitCanadaConfiguration } from './types';

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
