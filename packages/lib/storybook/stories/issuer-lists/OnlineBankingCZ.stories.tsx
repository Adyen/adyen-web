import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { IssuerListConfiguration } from '../../../src/components/helpers/IssuerListContainer/types';
import { Checkout } from '../Checkout';
import { OnlineBankingCZ } from '../../../src';

type OnlineBankingCZStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'IssuerList/OnlineBankingCZ'
};

export const Default: OnlineBankingCZStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingCZ(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'CZ'
    }
};

export default meta;
