import { h } from 'preact';
import { SplitFundingSourceStoryProps } from '../../../../../storybook/types';
import { CardConfiguration, FundingSourceKeys } from '../../types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import Card from '../../Card';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';

const ConfigDescription = ({ config }: { readonly config: CardConfiguration }) => {
    const fundingSource = config.fundingSource || 'Not specified';
    const brands = config.brands ? config.brands.join(', ') : 'Not specified';
    const allowedFundingSources = config.configuration?.allowedFundingSources || 'Not specified';

    return (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
            <div>fundingSource: {fundingSource}</div>
            <div>brands: {brands}</div>
            <div>allowedFundingSources: {allowedFundingSources}</div>
            {/* <div>rawConfig: {JSON.stringify(config)}</div> */}
        </div>
    );
};

export const SplitFundingSourceCards = (args: SplitFundingSourceStoryProps<CardConfiguration>) => {
    const { componentConfiguration, applyFundingSourceValidation, ...checkoutConfig } = args;

    const buildCardConfig = (fundingSource: FundingSourceKeys): CardConfiguration => ({
        ...componentConfiguration,
        fundingSource,
        configuration: {
            ...componentConfiguration?.configuration,
            ...(applyFundingSourceValidation && { allowedFundingSources: fundingSource })
        }
    });

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const card1 = new Card(checkout, buildCardConfig('credit'));
                const card2 = new Card(checkout, buildCardConfig('debit'));
                const card3 = new Card(checkout, buildCardConfig('prepaid'));

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3>Card Component 1 (Credit)</h3>
                            <ConfigDescription config={card1.props} />
                            <ComponentContainer element={card1} id="component-root" />
                        </div>
                        <div>
                            <h3>Card Component 2 (Debit)</h3>
                            <ConfigDescription config={card2.props} />
                            <ComponentContainer element={card2} id="component-root-debit" />
                        </div>
                        <div>
                            <h3>Card Component 3 (Prepaid)</h3>
                            <ConfigDescription config={card3.props} />
                            <ComponentContainer element={card3} id="component-root-prepaid" />
                        </div>
                    </div>
                );
            }}
        </Checkout>
    );
};
