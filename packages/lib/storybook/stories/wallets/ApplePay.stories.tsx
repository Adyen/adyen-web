import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { ComponentContainer } from '../ComponentContainer';
import { ApplePayConfiguration } from '../../../src/components/ApplePay/types';
import { ApplePay } from '../../../src';

type ApplePayStory = StoryConfiguration<ApplePayConfiguration>;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Wallets/ApplePay'
};

const createComponent = (args: PaymentMethodStoryProps<ApplePayConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const applepay = new ApplePay(checkout, componentConfiguration);
    return <ComponentContainer element={applepay} />;
};

export const Default: ApplePayStory = {
    render: createComponent,
    args: {}
};

export default meta;
