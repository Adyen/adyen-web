import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Iris from './Iris';
import { IrisConfiguration } from '../types';

type IrisStory = StoryConfiguration<IrisConfiguration>;

const meta: MetaConfiguration<IrisConfiguration> = {
    title: 'Components/IssuerList/Iris'
};

export const Default: IrisStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Iris(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'GR'
    }
};

export default meta;
