import { h } from 'preact';
import { Meta } from '@storybook/preact';
import Address from './Address';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import AddressElement from '../../Address/Address';
import { Checkout } from '../../../../storybook/components/Checkout';
import { StoryConfiguration } from '../../../../storybook/types';
import type { UIElementProps } from '../UIElement/types';

const meta: Meta = {
    title: 'Internal Elements/Address',
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
