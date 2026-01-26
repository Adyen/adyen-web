import { h } from 'preact';
import { AdyenCheckout, components } from '../../../..';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../../storybook/types';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';
import { DropinConfiguration } from '../../types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import { getComponentConfigFromUrl } from '../../../../../storybook/utils/get-configuration-from-url';
import DropinComponent from '../../Dropin';
import './customization.scss';

type DropinStory = StoryConfiguration<DropinConfiguration>;

const meta: MetaConfiguration<DropinConfiguration> = {
    title: 'Drop-in/Drop-in Component',
    tags: ['no-automated-visual-test'],
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        },
        sessionData: {
            control: 'object',
            if: { arg: 'useSessions', truthy: true }
        }
    },
    args: {
        componentConfiguration: getComponentConfigFromUrl() ?? {
            showRadioButton: false,
            instantPaymentTypes: ['googlepay', 'applepay'],
            showRemovePaymentMethodButton: false,
            paymentMethodsConfiguration: {
                googlepay: {
                    buttonType: 'plain',
                    challengeWindowSize: '05'
                }
            }
        }
    }
};

export const Default: DropinStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
        // Register all Components
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export const StyleCustomization: DropinStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
        // Register all Components
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

/**
 * Split funding Brazil
 * This story exist to test the CtP behaviour when the merchant has enabled the split funding / meal vouchers for Brazil
 * CtP should be hidden for the prepaid cards, and visible for the credit cards
 * This is story and not an integration test, because I could not find a way to test CtP as E2E test
 */
export const SplitFundingBrazil = {
    args: {
        countryCode: 'BR',
        componentConfiguration: {
            paymentMethodsConfiguration: {
                card: {
                    configuration: {
                        visaSrciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                        visaSrcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                        mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                        mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
                    },
                    clickToPayConfiguration: {
                        shopperEmail: 'levelaccess.ctp@adyen.com',
                        merchantDisplayName: 'Adyen Merchant Name'
                    }
                }
            }
        },
        sessionData: {
            splitCardFundingSources: true,
            shopperEmail: 'levelaccess.ctp@adyen.com',
            installmentOptions: {
                card: {
                    values: [2, 3, 5],
                    plans: ['regular']
                }
            }
        }
    },
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
        // Register all Components
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export default meta;
