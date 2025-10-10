import { h } from "preact";
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { CardConfiguration } from '../../types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import Card from '../../Card';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';

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
