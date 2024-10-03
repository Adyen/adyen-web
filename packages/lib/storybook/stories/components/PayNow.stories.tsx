import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { QRLoaderConfiguration } from '../../../src/types';
import PayNow from '../../../src/components/PayNow';

type PayNowStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/PayNow'
};

const createComponent = (args: PaymentMethodStoryProps<QRLoaderConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const paynow = new PayNow(checkout, componentConfiguration);
    return <Container element={paynow} />;
};

export const Default: PayNowStory = {
    render: createComponent,
    args: {
        countryCode: 'SG'
    }
};

export default meta;
