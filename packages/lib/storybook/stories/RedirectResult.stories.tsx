import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { getSearchParameter } from '../utils/get-query-parameters';
import { RedirectResultContainer } from './RedirectResultContainer';

type RedirectResultProps = {
    redirectResult: string;
    sessionId: string;
};

type RedirectStory = StoryObj<RedirectResultProps>;

const meta: Meta<RedirectResultProps> = {
    title: 'Helpers/RedirectResult'
};

export default meta;

export const RedirectResult: RedirectStory = {
    render: args => <RedirectResultContainer countryCode={'US'} {...args} />,
    args: {
        redirectResult: getSearchParameter('redirectResult') ?? undefined,
        sessionId: getSearchParameter('sessionId') ?? undefined
    }
};
