import { Meta, StoryObj } from '@storybook/preact';
import Toggle from '../../../src/components/internal/Toggle';
import { useState } from 'preact/hooks';

const meta: Meta = {
    title: 'Internals/Toggle',
    component: Toggle
};

export const Default: StoryObj = {
    render: () => {
        const [checked, setChecked] = useState<boolean>(false);
        return <Toggle checked={checked} onChange={setChecked} label={'Save your profile'} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export const Disabled: StoryObj = {
    render: () => {
        return <Toggle checked={false} disabled label={'Save your profile'} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export const Readonly: StoryObj = {
    render: () => {
        return <Toggle checked={false} readonly label={'Save your profile'} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export const ToggleOnly: StoryObj = {
    render: () => {
        const [checked, setChecked] = useState<boolean>(true);
        return <Toggle checked={checked} onChange={setChecked} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export const WithDescription: StoryObj = {
    render: () => {
        const [checked, setChecked] = useState<boolean>(true);
        return (
            <Toggle
                checked={checked}
                onChange={setChecked}
                label={'Save your profile'}
                description={'Save your profile for faster checkouts next time you buy our products'}
            />
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
