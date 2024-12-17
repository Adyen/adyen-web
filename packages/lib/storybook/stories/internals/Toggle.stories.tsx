import { Meta, StoryObj } from '@storybook/preact';
import Toggle from '../../../src/components/internal/Toggle';

const meta: Meta = {
    title: 'Internals/Toggle',
    component: Toggle
};

export const Default: StoryObj = {
    render: () => {
        return <Toggle checked={true} onChange={() => console.log('change')} label={'Save your info with Fastlane for faster checkouts'} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
