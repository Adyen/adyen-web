import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { VoucherConfiguration } from '../../../src/components/types';
import { Container } from '../Container';
import { Oxxo } from '../../../src';

type OxxoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Vouchers/Oxxo'
};

export const Default: OxxoStory = {
    render: (args: PaymentMethodStoryProps<VoucherConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const oxxo = new Oxxo(checkout, componentConfiguration);
        return <Container element={oxxo} />;
    },
    args: {
        countryCode: 'MX'
    }
};

export default meta;
