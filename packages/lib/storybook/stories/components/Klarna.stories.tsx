import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { KlarnaPaymentsProps } from '../../../src/components/Klarna/types';
import { Klarna } from '../../../src';

type KlarnaStory = StoryConfiguration<KlarnaPaymentsProps>;

const meta: MetaConfiguration<KlarnaPaymentsProps> = {
    title: 'Components/Klarna'
};

const createComponent = (args: PaymentMethodStoryProps<KlarnaPaymentsProps>, context) => {
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
