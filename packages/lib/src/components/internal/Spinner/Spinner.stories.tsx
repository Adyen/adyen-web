import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Spinner from './Spinner';

const meta: Meta = {
    title: 'Internal Elements/Spinner',
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
