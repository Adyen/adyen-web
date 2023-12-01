import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PayPalConfiguration } from '../../../src/components/PayPal/types';
import { Container } from '../Container';
import { PayPal } from '../../../src';

type PayPalStory = StoryConfiguration<PayPalConfiguration>;

const meta: MetaConfiguration<PayPalConfiguration> = {
    title: 'Wallets/Paypal'
};

export const Default: PayPalStory = {
    render: (args: PaymentMethodStoryProps<PayPalConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const paypal = new PayPal({ core: checkout, ...componentConfiguration });
        return <Container element={paypal} />;
    }
};

export default meta;
