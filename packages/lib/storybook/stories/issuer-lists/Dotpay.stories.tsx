import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { IssuerListContainerProps } from '../../../src/components/helpers/IssuerListContainer';
import { Dotpay } from '../../../src';

type DotpayStory = StoryConfiguration<IssuerListContainerProps>;

const meta: MetaConfiguration<IssuerListContainerProps> = {
    title: 'IssuerList/Dotpay'
};

export const Default: DotpayStory = {
    render: (args: PaymentMethodStoryProps<IssuerListContainerProps>, context) => {
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
