import { MetaConfiguration, StoryConfiguration } from '../types';
import { DonationConfiguration } from '../../../src/components/Donation/types';
import { Container } from '../Container';
import Donation from '../../../src/components/Donation';

const componentConfiguration: DonationConfiguration = {
    onDonate: (_, component) => setTimeout(() => component.setStatus('success'), 1000),
    onCancel: () => alert('Donation canceled'),
    nonprofitName: 'Test Charity',
    nonprofitUrl: 'https://example.org',
    nonprofitDescription: 'Lorem ipsum...',
    donation: {
        type: 'fixedAmounts',
        currency: 'EUR',
        values: [50, 199, 300]
    },
    termsAndConditionsUrl: 'https://www.adyen.com',
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png',
    commercialTxAmount: 1000
};

type DonationStory = StoryConfiguration<DonationConfiguration>;

const meta: MetaConfiguration<DonationConfiguration> = {
    title: 'Components/Donation'
};

export const Default: DonationStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        // @ts-ignore fix later
        <Container Element={Donation} checkoutConfig={checkoutConfig} componentConfig={componentConfiguration} />
    ),
    args: {
        componentConfiguration
    }
};

/*export const IntegrateWithCard = {
    render: args => <DonationCardIntegrationExample contextArgs={args} />,
    args: {
        redirectResult: getSearchParameter('redirectResult')
    }
};*/

export default meta;
