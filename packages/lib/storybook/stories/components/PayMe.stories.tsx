import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { QRLoaderConfiguration } from '../../../src/types';
import PayMe from '../../../src/components/PayMe';

type PayMeStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/PayMe'
};

const createComponent = (args: PaymentMethodStoryProps<QRLoaderConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const payme = new PayMe(checkout, componentConfiguration);
    return <Container element={payme} />;
};

export const Default: PayMeStory = {
    render: createComponent,
    args: {
        countryCode: 'HK'
    }
};

export default meta;
