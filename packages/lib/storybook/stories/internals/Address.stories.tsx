import { Meta } from '@storybook/preact';
import Address from '../../../src/components/internal/Address';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { ComponentContainer } from '../ComponentContainer';
import AddressElement from '../../../src/components/Address/Address';

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

export const Default = {
    render: (args, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const address = new AddressElement(checkout, componentConfiguration);
        return <ComponentContainer element={address} />;
    },
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
