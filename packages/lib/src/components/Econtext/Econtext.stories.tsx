import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Econtext from './Econtext';
import { EcontextConfiguration } from './types';
import { TxVariants } from '../tx-variants';

type EcontextStory = StoryConfiguration<EcontextConfiguration>;

const meta: MetaConfiguration<EcontextConfiguration> = {
    title: 'Components/Econtext'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EcontextConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Econtext(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: EcontextStory = {
    render,
    args: {
        countryCode: 'JP',
        componentConfiguration: {
            type: TxVariants.econtext_seven_eleven
        }
    }
};

export default meta;
