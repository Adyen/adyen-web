import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import MealVoucherFR from './MealVoucherFR';
import { GiftCardConfiguration } from '../types';

type MealVoucherFRStory = StoryConfiguration<GiftCardConfiguration>;

const meta: MetaConfiguration<GiftCardConfiguration> = {
    title: 'Components/Gift Cards/MealVoucherFR'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<GiftCardConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new MealVoucherFR(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: MealVoucherFRStory = {
    render,
    args: {
        countryCode: 'FR'
    }
};

export default meta;
