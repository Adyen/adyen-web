import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Doku from './Doku';
import { VoucherConfiguration } from '../types';
import { TxVariants } from '../tx-variants';

type DokuStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Components/Doku'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<VoucherConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Doku(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: DokuStory = {
    render,
    args: {
        countryCode: 'ID',
        componentConfiguration: {
            type: TxVariants.doku_wallet
        }
    }
};

export default meta;
