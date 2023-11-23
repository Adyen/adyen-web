import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { KlarnConfiguration } from '../../../src/components/Klarna/types';
import { Klarna } from '../../../src';

type KlarnaStory = StoryConfiguration<KlarnConfiguration>;

const meta: MetaConfiguration<KlarnConfiguration> = {
    title: 'Components/Klarna'
};

const createComponent = (args: PaymentMethodStoryProps<KlarnConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const klarna = new Klarna({ core: checkout, ...componentConfiguration });
    return <Container element={klarna} />;
};

export const Widget: KlarnaStory = {
    render: createComponent,
    args: {
        countryCode: 'NL',
        componentConfiguration: { useKlarnaWidget: true }
    }
};

export default meta;
