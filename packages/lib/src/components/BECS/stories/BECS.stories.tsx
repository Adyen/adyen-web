import { h } from 'preact';

import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import BECS from '..';

import type { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../storybook/types';
import type { BECSConfiguration } from '../types';

type BECSStory = StoryConfiguration<BECSConfiguration>;
const resultUrl = 'https://example.com/direct-debit-agreement.pdf';

const meta: MetaConfiguration<BECSConfiguration> = {
    title: 'Components/BECS'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<BECSConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new BECS(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: BECSStory = {
    render,
    args: {
        countryCode: 'AU'
    }
};

export const Success: BECSStory = {
    render,
    args: {
        countryCode: 'AU',
        componentConfiguration: {
            url: resultUrl
        }
    }
};

export default meta;
