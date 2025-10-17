import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import { Checkout } from '../../../storybook/components/Checkout';
import { OnlineBankingFI } from '../..';

type OnlineBankingFIStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'Components/IssuerList/OnlineBankingFI'
};

export const Default: OnlineBankingFIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingFI(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'FI'
    }
};

export default meta;
