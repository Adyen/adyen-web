import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { IssuerListConfiguration } from '../../../src/components/helpers/IssuerListContainer/types';
import { Dotpay } from '../../../src';

type DotpayStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'IssuerList/Dotpay'
};

export const Default: DotpayStory = {
    render: (args: PaymentMethodStoryProps<IssuerListConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const dotpay = new Dotpay({ core: checkout, ...componentConfiguration });
        return <Container element={dotpay} />;
    },
    args: {
        countryCode: 'PL'
    }
};

export default meta;
