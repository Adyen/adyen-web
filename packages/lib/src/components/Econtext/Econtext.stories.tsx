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

export const EcontextSevenEleven: EcontextStory = {
    render,
    args: {
        countryCode: 'JP',
        componentConfiguration: {
            type: TxVariants.econtext_seven_eleven
        }
    }
};

export const EcontextATM: EcontextStory = {
    render,
    args: {
        countryCode: 'JP',
        componentConfiguration: {
            type: TxVariants.econtext_atm
        }
    }
};

export const EcontextOnline: EcontextStory = {
    render,
    args: {
        countryCode: 'JP',
        componentConfiguration: {
            type: TxVariants.econtext_online
        }
    }
};

export const EcontextStores: EcontextStory = {
    render,
    args: {
        countryCode: 'JP',
        componentConfiguration: {
            type: TxVariants.econtext_stores
        }
    }
};

export const VoucherScreen: EcontextStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Econtext(checkout, {
                            reference: 'testreference',
                            paymentMethodType: TxVariants.econtext_seven_eleven,
                            // @ts-expect-error instructionsUrl is not defined in VoucherConfiguration
                            instructionsUrl: 'https://example.com/instructions',
                            collectionInstitutionNumber: '123456789',
                            maskedTelephoneNumber: '12*****89',
                            expiresAt: '2025-12-25T00:00:00.000Z',
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    ),
    args: {
        countryCode: 'JP'
    }
};

export default meta;
