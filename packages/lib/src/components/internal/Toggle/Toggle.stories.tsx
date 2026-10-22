import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Toggle from './Toggle';
import { useState } from 'preact/hooks';
import './Toggle.stories.scss';

const meta: Meta = {
    title: 'Internal Elements/Toggle',
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

const CustomizedToggles = ({ modifier }: { readonly modifier: 'css-variables' | 'deprecated-css-variables' }) => {
    const [checked, setChecked] = useState<boolean>(true);
    const [unchecked, setUnchecked] = useState<boolean>(false);

    return (
        <div className={`toggle-story-customization toggle-story-customization--${modifier}`}>
            <Toggle
                checked={checked}
                onChange={setChecked}
                label={'Save your profile'}
                description={'Save your profile for faster checkouts next time you buy our products'}
            />
            <Toggle checked={unchecked} onChange={setUnchecked} label={'Subscribe to the newsletter'} />
            <Toggle checked disabled label={'Disabled and checked'} />
            <Toggle checked={false} disabled label={'Disabled and unchecked'} />
        </div>
    );
};

export const CustomizedWithCssVariables: StoryObj = {
    render: () => <CustomizedToggles modifier="css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'How to customize the toggle now: the Bento v2 CSS variables it uses, scoped to `.adyen-checkout-toggle` so other components are unaffected.'
            }
        }
    }
};

export const CustomizedWithDeprecatedCssVariables: StoryObj = {
    render: () => <CustomizedToggles modifier="deprecated-css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'What a merchant still using the Bento v1 toggle variables gets. Every v1 toggle variable is set to reproduce the design above, but only the ones listed in `$deprecated-css-variables` still apply; the rest are ignored.'
            }
        }
    }
};

export default meta;
