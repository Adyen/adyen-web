import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { IssuerListConfiguration } from '../../../src/components/helpers/IssuerListContainer/types';
import { Checkout } from '../Checkout';
import { OnlineBankingSK } from '../../../src';

type OnlineBankingSKStory = StoryConfiguration<IssuerListConfiguration>;

const meta: MetaConfiguration<IssuerListConfiguration> = {
    title: 'IssuerList/OnlineBankingSK'
};

export const Default: OnlineBankingSKStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new OnlineBankingSK(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'SK'
    }
};

export default meta;
