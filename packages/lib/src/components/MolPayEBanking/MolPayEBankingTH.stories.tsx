import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import { Checkout } from '../../../storybook/components/Checkout';
import MolPayEBankingTH from './MolPayEBankingTH';

type MolPayEBankingTHStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/MolPayEBankingTH'
};

export const Default: MolPayEBankingTHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new MolPayEBankingTH(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'TH'
    }
};

export default meta;
