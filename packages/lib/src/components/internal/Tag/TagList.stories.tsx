import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { TagList } from './TagList';
import { TagListProps, TagVariant } from './types';

const meta: Meta<TagListProps> = {
    title: 'Internal Elements/TagList',
    tags: ['no-automated-visual-test'],
    component: TagList
};

export const Default: StoryObj<TagListProps> = {
    render: args => <TagList {...args} />,
    args: {
        tags: [
            { label: 'No cost', variant: TagVariant.SUCCESS },
            { label: 'Low cost', variant: TagVariant.INFO }
        ]
    }
};

export default meta;
