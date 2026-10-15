import { h } from 'preact';
import { GiftcardReloadDemo } from './GiftcardReloadDemo';
import type { Meta } from '@storybook/preact-vite';
import type { StoryConfiguration } from '../../../types';
import type { DropinConfiguration } from '../../../../src/components/Dropin/types';

type GiftcardReloadStory = StoryConfiguration<DropinConfiguration>;

const meta: Meta = {
    title: 'Demos/GiftcardReload',
    tags: ['no-automated-visual-test'],
    args: { countryCode: 'NL', useSessions: true }
};

/**
 * Unlike other stories, the session is persisted in `localStorage` and reused on the next load.
 * The persisted `sessionData` is refreshed every time `onOrderUpdated` fires.
 */
export const WithDropin: GiftcardReloadStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <GiftcardReloadDemo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'showPayButton'] }
    }
};

export default meta;
