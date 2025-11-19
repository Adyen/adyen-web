import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import { Checkout } from '../../../storybook/components/Checkout';
import MolPayEBankingVN from './MolPayEBankingVN';

type MolPayEBankingVNStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/MolPayEBankingVN'
};

export const Default: MolPayEBankingVNStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new MolPayEBankingVN(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'VN'
    }
};

export default meta;
