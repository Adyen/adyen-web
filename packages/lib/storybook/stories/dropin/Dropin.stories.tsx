import { Dropin as DropinComponent, AdyenCheckout, components } from '../../../src';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { DropinConfiguration } from '../../../src/components/Dropin/types';
import './customization.scss';
import { Checkout } from '../Checkout';

type DropinStory = StoryConfiguration<DropinConfiguration>;

const meta: MetaConfiguration<DropinConfiguration> = {
    title: 'Dropin/Default',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object'
        }
    },
    args: {
        componentConfiguration: {
            showRadioButton: false,
            instantPaymentTypes: ['googlepay'],
            showRemovePaymentMethodButton: false,
            paymentMethodsConfiguration: {
                googlepay: {
                    buttonType: 'plain'
                }
            }
        }
    }
};

export const Auto: DropinStory = {
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
            <div className={'dropin-customization'}>
                <Checkout checkoutConfig={checkoutConfig}>
                    {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
                </Checkout>
            </div>
        );
    }
};

export default meta;
