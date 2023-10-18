import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PayPalElementProps } from '../../../src/components/PayPal/types';
import { Container } from '../Container';
import { PayPal } from '../../../src';

type PayPalStory = StoryConfiguration<PayPalElementProps>;

const meta: MetaConfiguration<PayPalElementProps> = {
    title: 'Wallets/Paypal'
};

export const Default: PayPalStory = {
    render: (args: PaymentMethodStoryProps<PayPalElementProps>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const paypal = new PayPal({ core: checkout, ...componentConfiguration });
        return <Container element={paypal} />;
    }
};

export default meta;
