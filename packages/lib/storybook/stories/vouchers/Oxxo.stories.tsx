import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { VoucherActionElement } from '../../../src/components/types';
import { Container } from '../Container';
import { Oxxo } from '../../../src';

type OxxoStory = StoryConfiguration<VoucherActionElement>;

const meta: MetaConfiguration<VoucherActionElement> = {
    title: 'Vouchers/Oxxo'
};

export const Default: OxxoStory = {
    render: (args: PaymentMethodStoryProps<VoucherActionElement>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const oxxo = new Oxxo({ core: checkout, ...componentConfiguration });
        return <Container element={oxxo} />;
    },
    args: {
        countryCode: 'MX'
    }
};

export default meta;
