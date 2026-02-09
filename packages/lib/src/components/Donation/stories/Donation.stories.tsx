import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { DonationConfiguration } from '../types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Donation from '../Donation';
import { Checkout } from '../../../../storybook/components/Checkout';
import { getSearchParameter } from '../../../../storybook/utils/get-query-parameters';
import { DonationCardIntegrationExample } from './DonationCardIntegrationExample';

const componentConfiguration: DonationConfiguration = {
    onDonate: (_, component) => setTimeout(() => component.setStatus('success'), 1000),
    onCancel: () => alert('Donation canceled'),
    nonprofitName: 'Test Charity',
    nonprofitUrl: 'https://example.org',
    nonprofitDescription:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    donation: {
        type: 'fixedAmounts',
        currency: 'EUR',
        values: [50, 199, 300]
    },
    termsAndConditionsUrl: 'https://www.adyen.com',
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png',
    commercialTxAmount: 1000,
    causeName: 'Earthquake Turkey & Syria'
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
    tags: ['no-automated-visual-test'],
    args: {
        redirectResult: getSearchParameter('redirectResult')
    }
};

export default meta;
