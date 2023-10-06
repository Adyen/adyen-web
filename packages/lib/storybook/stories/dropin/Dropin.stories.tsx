import { Dropin as DropinComponent, AdyenCheckout, components } from '../../../src';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { Container } from '../Container';
import { DropinElementProps } from '../../../src/components/Dropin/types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type DropinStory = StoryConfiguration<DropinElementProps>;

const meta: MetaConfiguration<DropinElementProps> = {
    title: 'Dropin/Default',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        }
    },
    args: {
        componentConfiguration: {
            instantPaymentTypes: ['googlepay'],
            paymentMethodsConfiguration: {
                googlepay: {
                    buttonType: 'plain'
                }
            }
        }
    }
};

export const Auto: DropinStory = {
    render: (args: PaymentMethodStoryProps<DropinElementProps>, context) => {
        const { componentConfiguration } = args;

        // Picking up the Components to register
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        const checkout = getStoryContextCheckout(context);
        const dropin = new DropinComponent({ core: checkout, ...componentConfiguration });
        return <Container element={dropin} />;
    }
};

export default meta;
