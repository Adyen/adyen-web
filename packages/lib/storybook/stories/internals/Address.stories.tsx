import { Meta } from '@storybook/preact';
import Address from '../../../src/components/internal/Address';
import { ComponentContainer } from '../ComponentContainer';
import AddressElement from '../../../src/components/Address/Address';
import { Checkout } from '../Checkout';
import { StoryConfiguration } from '../types';
import type { UIElementProps } from '../../../src/components/internal/UIElement/types';

const meta: Meta = {
    title: 'Internals/Address',
    component: Address,
    argTypes: {
        size: {
            options: ['small', 'medium', 'large'],
            control: { type: 'radio' }
        }
    },
    args: {
        size: 'large'
    }
};

export const Default: StoryConfiguration<UIElementProps> = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new AddressElement(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL',
        amount: 2000,
        useSessions: false
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
