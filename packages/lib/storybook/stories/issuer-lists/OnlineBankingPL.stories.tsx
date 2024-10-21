import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { IssuerListConfiguration } from '../../../src/components/helpers/IssuerListContainer/types';
import OnlineBankingPL from '../../../src/components/OnlineBankingPL';
import { Checkout } from '../Checkout';

type OnlineBankingPLStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'IssuerList/OnlineBankingPL'
};

export const Default: OnlineBankingPLStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingPL(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'PL'
    }
};

export default meta;
