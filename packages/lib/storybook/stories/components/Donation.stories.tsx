import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { DonationConfiguration } from '../../../src/components/Donation/types';
import Donation from '../../../src/components/Donation';
import { Container } from '../Container';
import { DonationCardIntegrationExample } from './DonationCardIntegrationExample';
import { getSearchParameter } from '../../utils/get-query-parameters';

const componentConfiguration = {
    onDonate: (_, component) => setTimeout(() => component.setStatus('success'), 1000),
    onCancel: () => alert('Donation canceled'),
    nonprofitName: 'Test Charity',
    nonprofitUrl: 'https://example.org',
    nonprofitDescription: 'Lorem ipsum...',
    amounts: {
        currency: 'EUR',
        values: [50, 199, 300]
    },
    termsAndConditionsUrl: 'https://www.adyen.com',
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png'
};

type DonationStory = StoryConfiguration<DonationConfiguration>;

const meta: MetaConfiguration<DonationConfiguration> = {
    title: 'Components/Donation'
};

const createComponent = (args: PaymentMethodStoryProps<DonationConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    return <Container element={new Donation(checkout, componentConfiguration)} />;
};

export const Default: DonationStory = {
    render: createComponent,
    args: {
        componentConfiguration
    }
};

export const IntegrateWithCard = {
    render: args => <DonationCardIntegrationExample contextArgs={args} />,
    args: {
        redirectResult: getSearchParameter('redirectResult')
    }
};

export default meta;
