import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CardConfiguration } from '../../../src/components/Card/types';
import { Bancontact } from '../../../src';
import { Container } from '../Container';

type BancontactStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Bancontact'
};

const createComponent = (args: PaymentMethodStoryProps<CardConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const bancontact = new Bancontact({ core: checkout, ...componentConfiguration });

    return <Container element={bancontact} />;
};

export const Default: BancontactStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true
        }
    }
};

export default meta;
