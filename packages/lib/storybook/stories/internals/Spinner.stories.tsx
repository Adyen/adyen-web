import { Meta, StoryObj } from '@storybook/preact';
import Spinner from '../../../src/components/internal/Spinner';

const meta: Meta = {
    title: 'Internals/Spinner',
    component: Spinner,
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

export const Default: StoryObj = {
    render: args => {
        return <Spinner {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
