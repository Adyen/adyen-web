import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import { Checkout } from '../../../storybook/components/Checkout';
import OnlineBankingIN from './index';

type OnlineBankingINStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/OnlineBankingIN'
};

export const Default: OnlineBankingINStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingIN(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN'
    }
};

export default meta;
