import { PaymentMethodStoryProps } from '../../types';
import { CardConfiguration } from '../../../../src/components/Card/types';
import { Checkout } from '../../Checkout';
import Card from '../../../../src/components/Card/Card';
import { ComponentContainer } from '../../ComponentContainer';

export const createCardComponent = (args: PaymentMethodStoryProps<CardConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = args;
    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const card = new Card(checkout, componentConfiguration);
                globalThis.card = card;
                globalThis.parent.window['card'] = card;
                return <ComponentContainer element={card} />;
            }}
        </Checkout>
    );
};
