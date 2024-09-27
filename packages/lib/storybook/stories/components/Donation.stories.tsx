import { MetaConfiguration, StoryConfiguration } from '../types';
import { DonationConfiguration } from '../../../src/components/Donation/types';
import { ComponentContainer } from '../ComponentContainer';
import Donation from '../../../src/components/Donation/Donation';
import { Checkout } from '../Checkout';
import { DonationCardIntegrationExample } from './DonationCardIntegrationExample';
import { getSearchParameter } from '../../utils/get-query-parameters';

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
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Donation(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration
    }
};

export const IntegrateWithCard = {
    render: DonationCardIntegrationExample,
    args: {
        redirectResult: getSearchParameter('redirectResult')
    }
};

export default meta;
