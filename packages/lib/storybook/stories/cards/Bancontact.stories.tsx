import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CardElementProps } from '../../../src/components/Card/types';
import { Bancontact } from '../../../src';
import { Container } from '../Container';

type BancontactStory = StoryConfiguration<CardElementProps>;

const meta: MetaConfiguration<CardElementProps> = {
    title: 'Cards/Bancontact'
};

const createComponent = (args: PaymentMethodStoryProps<CardElementProps>, context) => {
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
