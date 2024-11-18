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

                globalThis.parent.window['card'] = card; // expose to top level window, so a user can access window.card

                return <ComponentContainer element={card} />;
            }}
        </Checkout>
    );
};
