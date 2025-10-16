import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import OnlineBankingPL from './OnlineBankingPL';
import { Checkout } from '../../../storybook/components/Checkout';
import { getComponentConfigFromUrl } from '../../../storybook/utils/get-configuration-from-url';

type OnlineBankingPLStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/OnlineBankingPL'
};

export const Default: OnlineBankingPLStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingPL(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'PL',
        componentConfiguration: getComponentConfigFromUrl() ?? {}
    }
};

export default meta;
