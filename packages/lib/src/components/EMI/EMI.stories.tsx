import { h } from 'preact';
import { EMI } from '@adyen/adyen-web';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import type { EMIConfiguration } from './types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

// TODO: revert to the default Storybook amount after the backend test
const EMI_STORY_AMOUNT = 15499900;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI',
    tags: ['no-automated-visual-test'],
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        }
    }
};

export const CardEmi: EMIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EMIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new EMI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        useSessions: false,
        countryCode: 'IN',
        amount: EMI_STORY_AMOUNT,
        componentConfiguration: {
            showPayButton: true,
            supportedPaymentMethodsConfiguration: {
                card: {
                    hasHolderName: false
                }
            }
        }
    }
};

export const CardEmiWithCustomButton: EMIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EMIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const emi = new EMI(checkout, componentConfiguration);
                return (
                    <div>
                        <ComponentContainer element={emi} />
                        <button id="custom-pay-button" onClick={() => emi.submit()}>
                            Pay with EMI
                        </button>
                    </div>
                );
            }}
        </Checkout>
    ),
    args: {
        useSessions: false,
        countryCode: 'IN',
        amount: EMI_STORY_AMOUNT,
        componentConfiguration: {
            showPayButton: false,
            supportedPaymentMethodsConfiguration: {
                card: {
                    hasHolderName: false
                }
            }
        }
    }
};

export default meta;
