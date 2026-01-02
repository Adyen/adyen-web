import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { VoucherConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import Oxxo from './Oxxo';
import { Checkout } from '../../../storybook/components/Checkout';
import { TxVariants } from '../tx-variants';

type OxxoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Components/Vouchers/Oxxo'
};

export const Default: OxxoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Oxxo(checkout, componentConfiguration)} />}</Checkout>
    ),

    args: {
        countryCode: 'MX'
    }
};

export const VoucherScreen: OxxoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Oxxo(checkout, {
                            reference: 'testreference',
                            paymentMethodType: TxVariants.oxxo,
                            // @ts-expect-error merchantReference is not defined in VoucherConfiguration
                            merchantReference: 'testmerchantreference',
                            alternativeReference: 'testalternativereference',
                            downloadUrl: 'https://example.com/download',
                            expiresAt: '2025-12-25T00:00:00.000Z',
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    ),
    args: {
        countryCode: 'MX'
    }
};

export default meta;
