import { Meta, StoryObj } from '@storybook/preact';
import Timeline from '../../../src/components/internal/Timeline';

const meta: Meta = {
    title: 'Internals/Timeline',
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
