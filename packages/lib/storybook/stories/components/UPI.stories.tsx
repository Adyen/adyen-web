import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UPIElementProps } from '../../../src/components/UPI/types';
import { Container } from '../Container';
import { UPI } from '../../../src';

type UpiStory = StoryConfiguration<UPIElementProps>;

const meta: MetaConfiguration<UPIElementProps> = {
    title: 'Components/UPI'
};

export const Default: UpiStory = {
    render: (args: PaymentMethodStoryProps<UPIElementProps>, context) => {
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
