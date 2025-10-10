import { h } from "preact";
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';

import { AdyenCheckout } from '../../core/AdyenCheckout';
import Dropin from '../Dropin';
import Ach from '.';

import type { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import type { AchConfiguration } from './types';

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
            enableStoreDetails: false
        }
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
