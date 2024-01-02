import { Meta, StoryObj } from '@storybook/preact';
import Spinner from '../../../src/components/internal/Spinner';
import { SpinnerProps } from '../../../src/components/internal/Spinner/Spinner';

const meta: Meta<SpinnerProps> = {
    title: 'Internals/Spinner',
    component: Spinner,
    argTypes: {
        size: {
            options: ['small', 'medium', 'large'],
            control: { type: 'radio' },
            description: 'Size of the spinner (small/medium/large)'
        },
        inline: {
            control: { type: 'boolean' },
            description: 'Whether the spinner should be rendered inline'
        }
    },
    args: {
        size: 'large',
        inline: false
    }
};

export const Default: StoryObj = {
    render: (args: SpinnerProps) => {
        return <Spinner {...args}></Spinner>;
    }
};

export default meta;
