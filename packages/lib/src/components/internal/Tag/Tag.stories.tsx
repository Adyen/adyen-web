import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { Tag } from './Tag';
import { TagProps, TagVariant } from './types';

const meta: Meta<TagProps> = {
    title: 'Internal Elements/Tag',
    component: Tag
};

export const Default: StoryObj<TagProps> = {
    render: args => <Tag {...args} />,
    args: {
        label: 'Low cost',
        variant: TagVariant.INFO
    }
};

export const Success: StoryObj<TagProps> = {
    render: args => <Tag {...args} />,
    args: {
        label: 'No cost',
        variant: TagVariant.SUCCESS
    }
};

export default meta;
