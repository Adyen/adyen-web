import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UPIConfiguration } from '../../../src/components/UPI/types';
import { Container } from '../Container';
import { UPI } from '../../../src';

type UpiStory = StoryConfiguration<UPIConfiguration>;

const meta: MetaConfiguration<UPIConfiguration> = {
    title: 'Components/UPI'
};

export const Default: UpiStory = {
    render: (args: PaymentMethodStoryProps<UPIConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const upi = new UPI({ core: checkout, ...componentConfiguration });
        return <Container element={upi} />;
    },
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            defaultMode: 'vpa'
        }
    }
};

export default meta;
