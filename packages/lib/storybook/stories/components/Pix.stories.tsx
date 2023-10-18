import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PixProps } from '../../../src/components/Pix/types';
import { Container } from '../Container';
import { Pix } from '../../../src';

type PixStory = StoryConfiguration<PixProps>;

const meta: MetaConfiguration<PixProps> = {
    title: 'Components/Pix'
};

const createComponent = (args: PaymentMethodStoryProps<PixProps>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const pix = new Pix({ core: checkout, ...componentConfiguration });
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
