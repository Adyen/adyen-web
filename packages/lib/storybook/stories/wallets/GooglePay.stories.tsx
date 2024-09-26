import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { ComponentContainer } from '../ComponentContainer';
import { GooglePayConfiguration } from '../../../src/components/GooglePay/types';
import { GooglePay } from '../../../src';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Wallets/GooglePay'
};

const createComponent = (args: PaymentMethodStoryProps<GooglePayConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const googlepay = new GooglePay(checkout, componentConfiguration);
    return <ComponentContainer element={googlepay} />;
};

export const Default: GooglePayStory = {
    render: createComponent
};

export default meta;
