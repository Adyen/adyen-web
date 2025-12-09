import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import { Checkout } from '../../../storybook/components/Checkout';
import MolPayEBankingMY from './MolPayEBankingMY';

type MolPayEBankingMYStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/MolPayEBankingMY'
};

export const Default: MolPayEBankingMYStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new MolPayEBankingMY(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'MY'
    }
};

export default meta;
