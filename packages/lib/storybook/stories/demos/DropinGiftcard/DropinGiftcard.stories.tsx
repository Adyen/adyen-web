import { h } from 'preact';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { DropinGiftcardDemo } from './DropinGiftcardDemo';
import { getSearchParameter } from '../../../utils/get-query-parameters';

interface DropinGiftcardStoryArgs {
    countryCode: string;
    shopperLocale: string;
    amount: number;
    sessionId?: string;
}

type DropinGiftcardStory = StoryObj<DropinGiftcardStoryArgs>;

const meta: Meta<DropinGiftcardStoryArgs> = {
    title: 'Demos/DropinGiftcard',
    tags: ['no-automated-visual-test'],
    argTypes: {
        sessionId: {
            control: 'text',
            description: 'Persisted session ID — populated automatically after the first load and reused on reload.'
        }
    },
    args: {
        sessionId: getSearchParameter('sessionId') ?? undefined
    }
};

export const Default: DropinGiftcardStory = {
    render: ({ countryCode, shopperLocale, amount, sessionId }, context) => {
        const handleSessionCreated = (newSessionId: string) => {
            context.args.sessionId = newSessionId;
        };

        return (
            <DropinGiftcardDemo
                countryCode={countryCode}
                shopperLocale={shopperLocale}
                amount={amount}
                sessionId={sessionId}
                onSessionCreated={handleSessionCreated}
            />
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'showPayButton'] }
    }
};

export default meta;
