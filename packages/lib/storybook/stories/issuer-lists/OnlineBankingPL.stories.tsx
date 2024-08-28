import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { IssuerListConfiguration } from '../../../src/components/helpers/IssuerListContainer/types';
import { OnlineBankingPL } from '../../../src';

type OnlineBankingPLStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'IssuerList/OnlineBankingPL'
};

export const Default: OnlineBankingPLStory = {
    render: (args: PaymentMethodStoryProps<IssuerListConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const onlineBankingPL = new OnlineBankingPL(checkout, componentConfiguration);
        return <Container element={onlineBankingPL} />;
    },
    args: {
        countryCode: 'PL'
    }
};

export default meta;
