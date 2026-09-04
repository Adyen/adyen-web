import { renderCardReviewPage, renderDropinReviewPage } from './review-page-renders';
import type { Meta } from '@storybook/preact-vite';
import type { StoryConfiguration } from '../../../types';
import type { DropinConfiguration } from '../../../../src/components/Dropin/types';
import type { CardConfiguration } from '../../../../src/components/Card/types';

const meta: Meta = {
    title: 'Demos/ReviewPage',
    tags: ['no-automated-visual-test'],
    args: { countryCode: 'NL', useSessions: true }
};

export const WithDropin: StoryConfiguration<DropinConfiguration> = {
    render: renderDropinReviewPage
};

export const WithCardComponent: StoryConfiguration<CardConfiguration> = {
    render: renderCardReviewPage
};

export default meta;
