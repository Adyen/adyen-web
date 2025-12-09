import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Dragonpay from './Dragonpay';
import { DragonpayConfiguraton } from './types';
import { TxVariants } from '../tx-variants';

type DragonpayStory = StoryConfiguration<DragonpayConfiguraton>;

const meta: MetaConfiguration<DragonpayConfiguraton> = {
    title: 'Components/Dragonpay'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DragonpayConfiguraton>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new Dragonpay(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: DragonpayStory = {
    render,
    args: {
        countryCode: 'PH',
        componentConfiguration: {
            type: TxVariants.dragonpay_ebanking
        }
    }
};

export default meta;
