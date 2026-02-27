import { h } from 'preact';
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { CardConfiguration } from '../../types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import Card from '../../Card';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';

const ConfigDescription = ({ config }: { config: CardConfiguration }) => {
    const fundingSource = config.fundingSource || 'Not specified';
    const brands = config.brands ? config.brands.join(', ') : 'Not specified';

    return (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
            <div>fundingSource: {fundingSource}</div>
            <div>brands: {brands}</div>
            {/* <div>rawConfig: {JSON.stringify(config)}</div> */}
        </div>
    );
};

export const SplitFundingSourceCards = (args: PaymentMethodStoryProps<CardConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = args;

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const card1 = new Card(checkout, { ...componentConfiguration, fundingSource: 'credit' });
                const card2 = new Card(checkout, { ...componentConfiguration, fundingSource: 'debit' });
                const card3 = new Card(checkout, { ...componentConfiguration, fundingSource: 'prepaid' });

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3>Card Component 1 (Credit)</h3>
                            <ConfigDescription config={card1.props} />
                            <ComponentContainer element={card1} />
                        </div>
                        <div>
                            <h3>Card Component 2 (Debit)</h3>
                            <ConfigDescription config={card2.props} />
                            <ComponentContainer element={card2} />
                        </div>
                        <div>
                            <h3>Card Component 3 (Prepaid)</h3>
                            <ConfigDescription config={card3.props} />
                            <ComponentContainer element={card3} />
                        </div>
                    </div>
                );
            }}
        </Checkout>
    );
};
