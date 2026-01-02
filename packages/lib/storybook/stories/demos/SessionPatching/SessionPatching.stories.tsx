import { h } from 'preact';
import { DropinDemo } from './DropinDemo';
import { ComponentsDemo } from './ComponentsDemo';
import type { Meta } from '@storybook/preact-vite';
import type { StoryConfiguration } from '../../../types';

type SessionPatchingStory = StoryConfiguration<{}>;

const meta: Meta<SessionPatchingStory> = {
    title: 'Demos/SessionPatching'
};

export const WithDropin: SessionPatchingStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <DropinDemo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export const WithComponents: SessionPatchingStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <ComponentsDemo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
