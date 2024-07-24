import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PixConfiguration } from '../../../src/components/Pix/types';
import { Container } from '../Container';
import { Pix } from '../../../src';

type PixStory = StoryConfiguration<PixConfiguration>;

const meta: MetaConfiguration<PixConfiguration> = {
    title: 'Components/Pix'
};

const createComponent = (args: PaymentMethodStoryProps<PixConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const pix = new Pix(checkout, componentConfiguration);
    return <Container element={pix} />;
};

export const Default: PixStory = {
    render: createComponent,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render: createComponent,
    args: {
        ...Default.args,
        componentConfiguration: {
            personalDetailsRequired: true
        }
    }
};

export default meta;
