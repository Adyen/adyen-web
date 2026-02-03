import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import EMI from './EMI';
import { EMIConfiguration } from './types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI'
};

export const Default: EMIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new EMI(checkout, componentConfiguration)} />}</Checkout>
    )
};

export default meta;
