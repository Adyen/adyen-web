import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { Timeline } from './Timeline';

const meta: Meta = {
    title: 'Internal Elements/Timeline',
    tags: ['no-automated-visual-test'],
    component: Timeline
};

export const Default: StoryObj = {
    render: () => {
        const instructions = [
            'Open the banking app',
            "Enter your email, ID, name, surname, fax number, grandmother's name, postal code, secret word",
            'Wait for the OTP',
            'Complete the payment in the app and wait for the confirmation here'
        ];
        return <Timeline instructions={instructions} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
