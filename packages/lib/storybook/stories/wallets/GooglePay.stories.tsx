import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { GooglePayProps } from '../../../src/components/GooglePay/types';
import { GooglePay } from '../../../src';

type GooglePayStory = StoryConfiguration<GooglePayProps>;

const meta: MetaConfiguration<GooglePayProps> = {
    title: 'Wallets/GooglePay'
};

const createComponent = (args: PaymentMethodStoryProps<GooglePayProps>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const googlepay = new GooglePay({ core: checkout, ...componentConfiguration });
    return <Container element={googlepay} />;
};

export const Default: GooglePayStory = {
    render: createComponent
};

export default meta;
